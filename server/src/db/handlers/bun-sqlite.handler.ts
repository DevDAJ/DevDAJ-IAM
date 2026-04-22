import { Database } from "bun:sqlite";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { generateApiKey, hashApiKey } from "../crypto";
import type { AppDatabaseHandler, ExternalApiKeyRow, ScopeDefinitionRow } from "../types";

export type BunSqliteHandlerOptions = {
  /** SQLite file path */
  databasePath: string;
};

function initAppSchema(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS scope_definition (
      id TEXT PRIMARY KEY NOT NULL,
      key TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_scope (
      user_id TEXT NOT NULL,
      scope_id TEXT NOT NULL,
      PRIMARY KEY (user_id, scope_id),
      FOREIGN KEY (scope_id) REFERENCES scope_definition(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS external_api_key (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      key_prefix TEXT NOT NULL,
      can_manage_users INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_user_scope_user ON user_scope(user_id);
  `);
}

export function createBunSqliteAppDatabaseHandler(
  options: BunSqliteHandlerOptions,
): AppDatabaseHandler {
  fs.mkdirSync(path.dirname(options.databasePath), { recursive: true });

  const db = new Database(options.databasePath);
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");
  initAppSchema(db);

  const handler: AppDatabaseHandler = {
    id: "bun-sqlite",

    async listScopeDefinitions(): Promise<ScopeDefinitionRow[]> {
      return db
        .prepare(
          `SELECT id, key, label, description, created_at FROM scope_definition ORDER BY key ASC`,
        )
        .all() as ScopeDefinitionRow[];
    },

    async createScopeDefinition(input: {
      key: string;
      label: string;
      description?: string | null;
    }): Promise<ScopeDefinitionRow> {
      const id = randomBytes(16).toString("hex");
      const created_at = Date.now();
      db.prepare(
        `INSERT INTO scope_definition (id, key, label, description, created_at) VALUES (?, ?, ?, ?, ?)`,
      ).run(id, input.key, input.label, input.description ?? null, created_at);
      return {
        id,
        key: input.key,
        label: input.label,
        description: input.description ?? null,
        created_at,
      };
    },

    async deleteScopeDefinition(id: string): Promise<boolean> {
      const r = db.prepare(`DELETE FROM scope_definition WHERE id = ?`).run(id);
      return r.changes > 0;
    },

    async getUserScopeKeys(userId: string): Promise<string[]> {
      const rows = db
        .prepare(
          `SELECT d.key FROM user_scope u
           JOIN scope_definition d ON d.id = u.scope_id
           WHERE u.user_id = ?`,
        )
        .all(userId) as { key: string }[];
      return rows.map((r) => r.key);
    },

    async setUserScopes(userId: string, scopeIds: string[]): Promise<void> {
      const del = db.prepare(`DELETE FROM user_scope WHERE user_id = ?`);
      const ins = db.prepare(`INSERT INTO user_scope (user_id, scope_id) VALUES (?, ?)`);
      const tx = db.transaction(() => {
        del.run(userId);
        for (const sid of scopeIds) {
          ins.run(userId, sid);
        }
      });
      tx();
    },

    async validateExternalApiKey(raw: string) {
      const key_hash = hashApiKey(raw);
      const row = db
        .prepare(`SELECT id, name, can_manage_users FROM external_api_key WHERE key_hash = ?`)
        .get(key_hash) as { id: string; name: string; can_manage_users: number } | undefined;
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        can_manage_users: row.can_manage_users === 1,
      };
    },

    async createExternalApiKey(input: { name: string; can_manage_users: boolean }) {
      const { raw, prefix } = generateApiKey();
      const id = randomBytes(12).toString("hex");
      const key_hash = hashApiKey(raw);
      const created_at = Date.now();
      db.prepare(
        `INSERT INTO external_api_key (id, name, key_hash, key_prefix, can_manage_users, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(id, input.name, key_hash, prefix, input.can_manage_users ? 1 : 0, created_at);
      return { rawKey: raw, prefix, id };
    },

    async listExternalApiKeys(): Promise<ExternalApiKeyRow[]> {
      const rows = db
        .prepare(
          `SELECT id, name, key_prefix, can_manage_users, created_at FROM external_api_key ORDER BY created_at DESC`,
        )
        .all() as {
        id: string;
        name: string;
        key_prefix: string;
        can_manage_users: number;
        created_at: number;
      }[];
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        key_prefix: r.key_prefix,
        can_manage_users: r.can_manage_users === 1,
        created_at: r.created_at,
      }));
    },

    async revokeExternalApiKey(id: string): Promise<boolean> {
      const r = db.prepare(`DELETE FROM external_api_key WHERE id = ?`).run(id);
      return r.changes > 0;
    },
  };

  return handler;
}

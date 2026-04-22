import fs from "node:fs";
import path from "node:path";
import { Database } from "bun:sqlite";

let _db: Database | null = null;

/** Releases the DB handle (for tests only). */
export function resetBetterAuthDatabaseForTesting(): void {
  if (_db) {
    try {
      _db.close();
    } catch {
      /* ignore */
    }
  }
  _db = null;
}

export function getBetterAuthDatabase(): Database {
  if (!_db) {
    throw new Error(
      "Better Auth database is not ready — ensure auth module finished loading before use.",
    );
  }
  return _db;
}

/**
 * Opens the Better Auth SQLite database (users, sessions, accounts).
 * Env: `AUTH_DATABASE_PATH` (defaults to `./data/auth.db` under cwd).
 */
export function initBetterAuthDatabase(): Database {
  if (_db) return _db;

  const dbPath = process.env.AUTH_DATABASE_PATH ?? path.join(process.cwd(), "data", "auth.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.run("PRAGMA journal_mode = WAL;");
  sqlite.run("PRAGMA foreign_keys = ON;");
  _db = sqlite;
  return _db;
}

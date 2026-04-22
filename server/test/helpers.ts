import { Database } from "bun:sqlite";

/** Minimal `user` table matching `auth/user-queries` expectations (not a full Better Auth migration). */
export function ensureMinimalBetterAuthUserSchema(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL,
      emailVerified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      role TEXT,
      username TEXT,
      displayUsername TEXT,
      createdAt TEXT NOT NULL DEFAULT '',
      updatedAt TEXT NOT NULL DEFAULT ''
    );
  `);
}

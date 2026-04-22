import { getBetterAuthDatabase } from "./database";

/** Count rows in Better Auth `user` table. */
export async function countAuthUsers(): Promise<number> {
  const db = getBetterAuthDatabase();
  const row = db.prepare(`SELECT COUNT(*) as c FROM user`).get() as { c: number };
  return row.c;
}

export async function updateUserRoleByEmail(email: string, role: string): Promise<void> {
  const db = getBetterAuthDatabase();
  db.prepare(`UPDATE user SET role = ? WHERE email = ?`).run(role, email);
}

export async function findUserByIdForExternalApi(
  userId: string,
): Promise<Record<string, unknown> | undefined> {
  const db = getBetterAuthDatabase();
  const row = db
    .prepare(
      `SELECT id, name, email, emailVerified, image, role, username, displayUsername, createdAt, updatedAt FROM user WHERE id = ?`,
    )
    .get(userId) as Record<string, unknown> | null | undefined;
  return row ?? undefined;
}

export async function authUserExists(userId: string): Promise<boolean> {
  const db = getBetterAuthDatabase();
  const row = db.prepare(`SELECT id FROM user WHERE id = ?`).get(userId) as
    | { id: string }
    | undefined;
  return row != null;
}

import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { getBetterAuthDatabase, initBetterAuthDatabase } from "../src/auth/database";
import {
  authUserExists,
  countAuthUsers,
  findUserByIdForExternalApi,
  updateUserRoleByEmail,
} from "../src/auth/user-queries";
import { ensureMinimalBetterAuthUserSchema } from "./helpers";

describe("auth/user-queries", () => {
  beforeAll(() => {
    initBetterAuthDatabase();
    ensureMinimalBetterAuthUserSchema(getBetterAuthDatabase());
  });

  afterAll(() => {
    try {
      getBetterAuthDatabase().exec(`DELETE FROM user`);
    } catch {
      /* ignore */
    }
  });

  beforeEach(() => {
    const db = getBetterAuthDatabase();
    db.exec(`DELETE FROM user`);
    db.prepare(
      `INSERT INTO user (id, name, email, emailVerified, role, createdAt, updatedAt)
       VALUES (?, ?, ?, 1, 'user', '1', '1')`,
    ).run("u1", "Test", "t@example.com");
  });

  test("countAuthUsers", async () => {
    expect(await countAuthUsers()).toBe(1);
  });

  test("updateUserRoleByEmail", async () => {
    await updateUserRoleByEmail("t@example.com", "admin");
    const row = getBetterAuthDatabase()
      .prepare(`SELECT role FROM user WHERE email = ?`)
      .get("t@example.com") as { role: string };
    expect(row.role).toBe("admin");
  });

  test("findUserByIdForExternalApi", async () => {
    const row = await findUserByIdForExternalApi("u1");
    expect(row?.email).toBe("t@example.com");
    expect(await findUserByIdForExternalApi("missing")).toBeUndefined();
  });

  test("authUserExists", async () => {
    expect(await authUserExists("u1")).toBe(true);
    expect(await authUserExists("nope")).toBe(false);
  });
});

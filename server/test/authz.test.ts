import { afterEach, describe, expect, test } from "bun:test";
import type { User } from "better-auth/types";
import { isAdminUser, parseAdminUserIds } from "../src/lib/authz";

describe("lib/authz", () => {
  const prevAdmin = process.env.ADMIN_USER_IDS;

  afterEach(() => {
    process.env.ADMIN_USER_IDS = prevAdmin;
  });

  test("parseAdminUserIds splits and trims", () => {
    process.env.ADMIN_USER_IDS = " a , b , ";
    expect(parseAdminUserIds()).toEqual(["a", "b"]);
  });

  test("parseAdminUserIds empty when unset", () => {
    delete process.env.ADMIN_USER_IDS;
    expect(parseAdminUserIds()).toEqual([]);
  });

  test("isAdminUser true for admin role", () => {
    const u = { id: "1", role: "admin" } as User;
    expect(isAdminUser(u)).toBe(true);
  });

  test("isAdminUser true when id in ADMIN_USER_IDS", () => {
    process.env.ADMIN_USER_IDS = "x,y";
    const u = { id: "y", role: "user" } as User;
    expect(isAdminUser(u)).toBe(true);
  });

  test("isAdminUser false for plain user", () => {
    process.env.ADMIN_USER_IDS = "";
    const u = { id: "z", role: "user" } as User;
    expect(isAdminUser(u)).toBe(false);
  });

  test("isAdminUser handles comma-separated roles", () => {
    const u = { id: "1", role: "editor, admin" } as User;
    expect(isAdminUser(u)).toBe(true);
  });
});

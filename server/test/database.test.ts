import { describe, expect, test } from "bun:test";
import { getBetterAuthDatabase, initBetterAuthDatabase } from "../src/auth/database";

describe("auth/database", () => {
  test("initBetterAuthDatabase returns same instance", () => {
    const a = initBetterAuthDatabase();
    const b = initBetterAuthDatabase();
    expect(a).toBe(b);
  });

  test("getBetterAuthDatabase returns database after init", () => {
    initBetterAuthDatabase();
    const db = getBetterAuthDatabase();
    expect(db.prepare("SELECT 1 as n").get()).toEqual({ n: 1 });
  });
});

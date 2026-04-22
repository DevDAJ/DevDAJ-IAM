import { describe, expect, test } from "bun:test";
import {
  getBetterAuthDatabase,
  initBetterAuthDatabase,
  resetBetterAuthDatabaseForTesting,
} from "../src/auth/database";

/**
 * Runs last (file name) so Better Auth has finished using the DB for other tests.
 * Closes the auth SQLite handle and re-inits for a clean singleton.
 */
describe("auth/database reset (last)", () => {
  test("resetBetterAuthDatabaseForTesting clears singleton", () => {
    initBetterAuthDatabase();
    resetBetterAuthDatabaseForTesting();
    expect(() => getBetterAuthDatabase()).toThrow(/not ready/);
    initBetterAuthDatabase();
    expect(getBetterAuthDatabase().prepare("SELECT 1 as n").get()).toEqual({ n: 1 });
  });
});

import { beforeEach, describe, expect, test } from "bun:test";
import {
  getAppDatabaseHandler,
  initAppDatabase,
  listScopeDefinitions,
  resetAppDatabaseForTesting,
} from "../src/db";

describe("db/index", () => {
  beforeEach(async () => {
    resetAppDatabaseForTesting();
    await initAppDatabase();
  });

  test("getAppDatabaseHandler throws before init", async () => {
    resetAppDatabaseForTesting();
    expect(() => getAppDatabaseHandler()).toThrow(/initAppDatabase/);
  });

  test("initAppDatabase is idempotent", async () => {
    const a = await initAppDatabase();
    const b = await initAppDatabase();
    expect(a).toBe(b);
  });

  test("listScopeDefinitions returns array", async () => {
    const rows = await listScopeDefinitions();
    expect(Array.isArray(rows)).toBe(true);
  });
});

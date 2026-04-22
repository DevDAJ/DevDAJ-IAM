import { beforeEach, describe, expect, test } from "bun:test";
import { initBetterAuthDatabase } from "../src/auth/database";
import { initAppDatabase, resetAppDatabaseForTesting } from "../src/db";

describe("createIamApp admin gates", () => {
  beforeEach(async () => {
    resetAppDatabaseForTesting();
    await initAppDatabase();
    initBetterAuthDatabase();
  });

  test("admin routes return 401 without session", async () => {
    const { createIamApp } = await import("../src/app");
    const app = createIamApp();
    const paths = [
      "http://localhost/api/admin/scopes",
      "http://localhost/api/admin/api-keys",
    ];
    for (const url of paths) {
      const res = await app.handle(new Request(url));
      expect(res.status).toBe(401);
    }
  });
});

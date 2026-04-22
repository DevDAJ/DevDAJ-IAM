import { beforeEach, describe, expect, test } from "bun:test";
import { initBetterAuthDatabase } from "../src/auth/database";
import { initAppDatabase, resetAppDatabaseForTesting } from "../src/db";

describe("createIamApp set-password", () => {
  beforeEach(async () => {
    resetAppDatabaseForTesting();
    await initAppDatabase();
    initBetterAuthDatabase();
  });

  test("POST /api/app/account/set-password rejects missing password", async () => {
    const { createIamApp } = await import("../src/app");
    const res = await createIamApp().handle(
      new Request("http://localhost/api/app/account/set-password", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: "session=x" },
        body: JSON.stringify({}),
      }),
    );
    expect([400, 401]).toContain(res.status);
  });
});

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBunSqliteAppDatabaseHandler } from "../src/db/handlers/bun-sqlite.handler";

describe("bun-sqlite handler", () => {
  let dir: string;
  let dbPath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "iam-sqlite-"));
    dbPath = join(dir, "app.db");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  test("scopes and api keys lifecycle", async () => {
    const h = createBunSqliteAppDatabaseHandler({ databasePath: dbPath });
    expect(h.id).toBe("bun-sqlite");

    expect((await h.listScopeDefinitions()).length).toBe(0);

    const s = await h.createScopeDefinition({
      key: "k1",
      label: "L1",
      description: "d",
    });
    expect(s.key).toBe("k1");
    expect((await h.listScopeDefinitions()).length).toBe(1);

    await h.setUserScopes("user-1", [s.id]);
    expect(await h.getUserScopeKeys("user-1")).toEqual(["k1"]);

    const created = await h.createExternalApiKey({ name: "n1", can_manage_users: true });
    expect(created.rawKey.startsWith("daj_")).toBe(true);

    const v = await h.validateExternalApiKey(created.rawKey);
    expect(v?.name).toBe("n1");
    expect(v?.can_manage_users).toBe(true);
    expect(await h.validateExternalApiKey("bad")).toBeNull();

    const listed = await h.listExternalApiKeys();
    expect(listed.length).toBe(1);

    expect(await h.revokeExternalApiKey(created.id)).toBe(true);
    expect(await h.revokeExternalApiKey("missing")).toBe(false);

    expect(await h.deleteScopeDefinition(s.id)).toBe(true);
    expect(await h.deleteScopeDefinition(s.id)).toBe(false);
  });
});

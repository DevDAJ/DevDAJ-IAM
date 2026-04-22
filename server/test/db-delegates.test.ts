import { beforeEach, describe, expect, test } from "bun:test";
import {
  createExternalApiKey,
  createScopeDefinition,
  deleteScopeDefinition,
  getUserScopeKeys,
  initAppDatabase,
  listExternalApiKeys,
  listScopeDefinitions,
  resetAppDatabaseForTesting,
  revokeExternalApiKey,
  setUserScopes,
  validateExternalApiKey,
} from "../src/db";

describe("db/index delegates", () => {
  beforeEach(async () => {
    resetAppDatabaseForTesting();
    await initAppDatabase();
  });

  test("CRUD delegates round-trip", async () => {
    const row = await createScopeDefinition({
      key: "delegate-k",
      label: "L",
      description: null,
    });
    const listed = await listScopeDefinitions();
    expect(listed.some((r) => r.id === row.id)).toBe(true);

    await setUserScopes("u-delegate", [row.id]);
    expect(await getUserScopeKeys("u-delegate")).toEqual(["delegate-k"]);

    const { rawKey, id: keyId } = await createExternalApiKey({
      name: "d",
      can_manage_users: false,
    });
    expect(await validateExternalApiKey(rawKey)).toMatchObject({ name: "d" });
    expect(await validateExternalApiKey("bad")).toBeNull();

    const keys = await listExternalApiKeys();
    expect(keys.some((k) => k.id === keyId)).toBe(true);

    expect(await revokeExternalApiKey(keyId)).toBe(true);
    expect(await deleteScopeDefinition(row.id)).toBe(true);
  });
});

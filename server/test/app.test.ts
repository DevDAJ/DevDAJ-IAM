import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { getBetterAuthDatabase, initBetterAuthDatabase } from "../src/auth/database";
import {
  createExternalApiKey,
  initAppDatabase,
  listScopeDefinitions,
  resetAppDatabaseForTesting,
} from "../src/db";
import { ensureMinimalBetterAuthUserSchema } from "./helpers";

describe("createIamApp", () => {
  const realFetch = globalThis.fetch;

  beforeEach(async () => {
    resetAppDatabaseForTesting();
    await initAppDatabase();
    initBetterAuthDatabase();
    const adb = getBetterAuthDatabase();
    ensureMinimalBetterAuthUserSchema(adb);
    adb.exec(`DELETE FROM user`);
    adb.prepare(
      `INSERT INTO user (id, name, email, emailVerified, role, createdAt, updatedAt)
       VALUES ('ext-u', 'E', 'e@x.com', 1, 'user', '1', '1')`,
    ).run();
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  test("GET /health", async () => {
    const { createIamApp } = await import("../src/app");
    const res = await createIamApp().handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("GET /api/app/providers reflects env", async () => {
    const prev = {
      gid: process.env.GOOGLE_CLIENT_ID,
      gsec: process.env.GOOGLE_CLIENT_SECRET,
      hid: process.env.GITHUB_CLIENT_ID,
      hsec: process.env.GITHUB_CLIENT_SECRET,
    };
    process.env.GOOGLE_CLIENT_ID = "a";
    process.env.GOOGLE_CLIENT_SECRET = "b";
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    const { createIamApp } = await import("../src/app");
    const res = await createIamApp().handle(new Request("http://localhost/api/app/providers"));
    const body = (await res.json()) as { google: boolean; github: boolean };
    expect(body.google).toBe(true);
    expect(body.github).toBe(false);
    process.env.GOOGLE_CLIENT_ID = prev.gid;
    process.env.GOOGLE_CLIENT_SECRET = prev.gsec;
    process.env.GITHUB_CLIENT_ID = prev.hid;
    process.env.GITHUB_CLIENT_SECRET = prev.hsec;
  });

  test("GET /api/app/geo skips fetch for loopback", async () => {
    const { createIamApp } = await import("../src/app");
    const spy = mock(() => Promise.reject(new Error("should not call")));
    globalThis.fetch = spy as unknown as typeof fetch;
    const res = await createIamApp().handle(
      new Request("http://localhost/api/app/geo", {
        headers: { "x-forwarded-for": "127.0.0.1" },
      }),
    );
    const body = (await res.json()) as { ip: string; geo: unknown };
    expect(body.ip).toBe("127.0.0.1");
    expect(body.geo).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  test("GET /api/app/geo uses ip-api when public IP", async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          status: "success",
          country: "ZZ",
          city: "Test",
          lat: 1,
          lon: 2,
        }),
        { status: 200 },
      );
    const { createIamApp } = await import("../src/app");
    const res = await createIamApp().handle(
      new Request("http://localhost/api/app/geo", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      }),
    );
    const body = (await res.json()) as {
      ip: string;
      geo: { country?: string } | null;
    };
    expect(body.ip).toBe("203.0.113.1");
    expect(body.geo?.country).toBe("ZZ");
  });

  test("GET /api/v1/external/users/:id requires API key", async () => {
    const { createIamApp } = await import("../src/app");
    const res = await createIamApp().handle(
      new Request("http://localhost/api/v1/external/users/ext-u"),
    );
    expect(res.status).toBe(401);
  });

  test("GET /api/v1/external/users/:id returns user when key valid", async () => {
    const { rawKey } = await createExternalApiKey({ name: "k", can_manage_users: true });
    const scopes = await listScopeDefinitions();
    const { createIamApp } = await import("../src/app");
    const res = await createIamApp().handle(
      new Request("http://localhost/api/v1/external/users/ext-u", {
        headers: { "x-api-key": rawKey },
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { user: { email: string }; scopeKeys: string[] };
    expect(body.user.email).toBe("e@x.com");
    expect(Array.isArray(body.scopeKeys)).toBe(true);
    expect(scopes.length).toBeGreaterThanOrEqual(0);
  });
});

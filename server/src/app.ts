import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth } from "./auth";
import { authUserExists, findUserByIdForExternalApi } from "./auth/user-queries";
import {
  createExternalApiKey,
  createScopeDefinition,
  deleteScopeDefinition,
  getUserScopeKeys,
  listExternalApiKeys,
  listScopeDefinitions,
  revokeExternalApiKey,
  setUserScopes,
  validateExternalApiKey,
} from "./db";
import { isAdminUser } from "./lib/authz";

const corsOrigin =
  process.env.CORS_ORIGIN ?? process.env.TRUSTED_ORIGINS ?? "http://localhost:5173";

const withAuth = new Elysia({ name: "iam-auth" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      if (!session) return status(401);
      return { user: session.user, session: session.session };
    },
  },
  admin: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      if (!session) return status(401);
      if (!isAdminUser(session.user)) return status(403);
      return { user: session.user, session: session.session };
    },
  },
});

function getBearerApiKey(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim() || null;
}

function getApiKeyFromRequest(request: Request): string | null {
  return request.headers.get("x-api-key")?.trim() || getBearerApiKey(request);
}

/** HTTP app (no listen). Bootstrap DB with `initAppDatabase()` before handling requests that touch IAM tables. */
export function createIamApp() {
  return new Elysia()
    .use(
      cors({
        origin: corsOrigin.split(",").map((s) => s.trim()),
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
      }),
    )
    .all("/api/auth/*", ({ request }) => auth.handler(request))
    .use(withAuth)
    .get("/health", () => ({ ok: true }))
    .get("/api/app/providers", () => ({
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    }))
    .post("/api/app/account/set-password", async ({ request, body, status }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return status(401, { message: "Unauthorized" });
      const pw = (body as { newPassword?: string })?.newPassword;
      if (!pw || typeof pw !== "string") {
        return status(400, { message: "newPassword required" });
      }
      try {
        await auth.api.setPassword({
          body: { newPassword: pw },
          headers: request.headers,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return status(400, { message: msg });
      }
      return { ok: true };
    })
    .get("/api/app/me", async ({ request: { headers } }) => {
      const session = await auth.api.getSession({ headers });
      if (!session)
        return new Response(JSON.stringify({ user: null }), {
          status: 401,
          headers: { "content-type": "application/json" },
        });
      const admin = isAdminUser(session.user);
      const scopeKeys = admin ? await getUserScopeKeys(session.user.id) : undefined;
      return {
        user: session.user,
        isAdmin: admin,
        ...(admin ? { scopeKeys } : {}),
      };
    })
    .get("/api/app/geo", async ({ request }) => {
      const xf = request.headers.get("x-forwarded-for");
      const ip = xf?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
      let geo: {
        country?: string;
        city?: string;
        lat?: number;
        lon?: number;
      } | null = null;
      if (ip && ip !== "unknown" && !ip.startsWith("127.")) {
        try {
          const r = await fetch(
            `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city,lat,lon`,
          );
          if (r.ok) {
            const j = (await r.json()) as {
              status?: string;
              country?: string;
              city?: string;
              lat?: number;
              lon?: number;
            };
            if (j.status === "success") {
              geo = {
                country: j.country,
                city: j.city,
                lat: j.lat,
                lon: j.lon,
              };
            }
          }
        } catch {
          geo = null;
        }
      }
      return { ip, source: "headers" as const, geo };
    })
    .get("/api/admin/scopes", async () => ({ scopes: await listScopeDefinitions() }), { admin: true })
    .post(
      "/api/admin/scopes",
      async ({ body, status }) => {
        const b = body as { key: string; label: string; description?: string };
        if (!b?.key?.trim() || !b?.label?.trim()) {
          return status(400, { message: "key and label are required" });
        }
        try {
          const row = await createScopeDefinition({
            key: b.key.trim(),
            label: b.label.trim(),
            description: b.description?.trim() || null,
          });
          return { scope: row };
        } catch {
          return status(400, { message: "scope key must be unique" });
        }
      },
      { admin: true },
    )
    .delete(
      "/api/admin/scopes/:id",
      async ({ params: { id }, status }) => {
        const ok = await deleteScopeDefinition(id);
        if (!ok) return status(404, { message: "not found" });
        return { ok: true };
      },
      { admin: true },
    )
    .get(
      "/api/admin/users/:userId/scopes",
      async ({ params: { userId } }) => {
        const keys = new Set(await getUserScopeKeys(userId));
        const definitions = await listScopeDefinitions();
        return {
          scopeKeys: await getUserScopeKeys(userId),
          definitions,
          assignedIds: definitions.filter((d) => keys.has(d.key)).map((d) => d.id),
        };
      },
      { admin: true },
    )
    .put(
      "/api/admin/users/:userId/scopes",
      async ({ params: { userId }, body, status }) => {
        const ids = (body as { scopeIds?: string[] })?.scopeIds;
        if (!Array.isArray(ids)) return status(400, { message: "scopeIds array required" });
        const valid = new Set((await listScopeDefinitions()).map((s) => s.id));
        for (const id of ids) {
          if (!valid.has(id)) return status(400, { message: `invalid scope id: ${id}` });
        }
        await setUserScopes(userId, ids);
        return { ok: true, scopeKeys: await getUserScopeKeys(userId) };
      },
      { admin: true },
    )
    .get(
      "/api/admin/api-keys",
      async () => ({
        keys: (await listExternalApiKeys()).map((k) => ({
          id: k.id,
          name: k.name,
          key_prefix: k.key_prefix,
          can_manage_users: k.can_manage_users,
          created_at: k.created_at,
        })),
      }),
      { admin: true },
    )
    .post(
      "/api/admin/api-keys",
      async ({ body, status }) => {
        const b = body as { name?: string; can_manage_users?: boolean };
        if (!b?.name?.trim()) return status(400, { message: "name is required" });
        const { rawKey, id, prefix } = await createExternalApiKey({
          name: b.name.trim(),
          can_manage_users: Boolean(b.can_manage_users),
        });
        return {
          id,
          apiKey: rawKey,
          key_prefix: prefix,
          message: "Store this key securely; it will not be shown again.",
        };
      },
      { admin: true },
    )
    .delete(
      "/api/admin/api-keys/:id",
      async ({ params: { id }, status }) => {
        const ok = await revokeExternalApiKey(id);
        if (!ok) return status(404, { message: "not found" });
        return { ok: true };
      },
      { admin: true },
    )
    .get("/api/v1/external/users/:userId", async ({ params: { userId }, request, status }) => {
      const raw = getApiKeyFromRequest(request);
      if (!raw) return status(401, { message: "API key required" });
      const key = await validateExternalApiKey(raw);
      if (!key) return status(401, { message: "invalid API key" });
      if (!key.can_manage_users) return status(403, { message: "missing permission" });

      const row = await findUserByIdForExternalApi(userId);
      if (!row) return status(404, { message: "user not found" });

      return {
        user: row,
        scopeKeys: await getUserScopeKeys(userId),
      };
    })
    .patch(
      "/api/v1/external/users/:userId/scopes",
      async ({ params: { userId }, request, body, status }) => {
        const raw = getApiKeyFromRequest(request);
        if (!raw) return status(401, { message: "API key required" });
        const key = await validateExternalApiKey(raw);
        if (!key) return status(401, { message: "invalid API key" });
        if (!key.can_manage_users) return status(403, { message: "missing permission" });

        const ids = (body as { scopeIds?: string[] })?.scopeIds;
        if (!Array.isArray(ids)) return status(400, { message: "scopeIds array required" });
        const valid = new Set((await listScopeDefinitions()).map((s) => s.id));
        for (const id of ids) {
          if (!valid.has(id)) return status(400, { message: `invalid scope id: ${id}` });
        }
        if (!(await authUserExists(userId))) return status(404, { message: "user not found" });

        await setUserScopes(userId, ids);
        return { ok: true, scopeKeys: await getUserScopeKeys(userId) };
      },
    );
}

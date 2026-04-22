import { betterAuth } from "better-auth";
import { admin, username } from "better-auth/plugins";
import { initBetterAuthDatabase } from "./auth/database";

const database = initBetterAuthDatabase();

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const secret =
  process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret-replace-in-production-min-32-chars!!";

function parseAdminUserIds(): string[] {
  const raw = process.env.ADMIN_USER_IDS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

export const auth = betterAuth({
  appName: "DevDAJ IAM",
  baseURL,
  basePath: "/api/auth",
  secret,
  database,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            async getUserInfo(token) {
              let email: string | undefined;
              let sub: string | undefined;
              let name: string | undefined;
              let picture: string | undefined;
              let emailVerified = false;

              if (token.idToken) {
                const parts = token.idToken.split(".");
                if (parts[1]) {
                  try {
                    const payload = JSON.parse(
                      Buffer.from(parts[1], "base64url").toString("utf8"),
                    ) as Record<string, unknown>;
                    sub = payload.sub as string | undefined;
                    email = payload.email as string | undefined;
                    name = payload.name as string | undefined;
                    picture = payload.picture as string | undefined;
                    emailVerified = Boolean(payload.email_verified);
                  } catch {
                    /* fall through to userinfo */
                  }
                }
              }

              if (!email && token.accessToken) {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${token.accessToken}` },
                });
                if (res.ok) {
                  const data = (await res.json()) as {
                    sub?: string;
                    email?: string;
                    name?: string;
                    picture?: string;
                    email_verified?: boolean;
                  };
                  sub = data.sub ?? sub;
                  email = data.email ?? email;
                  name = data.name ?? name;
                  picture = data.picture ?? picture;
                  emailVerified = Boolean(data.email_verified);
                }
              }

              if (!sub) return null;

              return {
                user: {
                  id: sub,
                  name: name ?? "",
                  email: email ?? `oauth-google-${sub}@placeholder.local`,
                  image: picture,
                  emailVerified,
                },
                data: { source: "google", hadEmailInToken: Boolean(email) },
              };
            },
          },
        }
      : {}),
    ...(githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            scope: ["read:user", "user:email"],
            async getUserInfo(token) {
              const ures = await fetch("https://api.github.com/user", {
                headers: {
                  "User-Agent": "better-auth",
                  authorization: `Bearer ${token.accessToken}`,
                },
              });
              if (!ures.ok) return null;
              const profile = (await ures.json()) as {
                id: number;
                email?: string | null;
                name?: string | null;
                login: string;
                avatar_url?: string;
              };

              let email = profile.email ?? undefined;
              let emailVerified = false;

              if (!email) {
                const eres = await fetch("https://api.github.com/user/emails", {
                  headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                    "User-Agent": "better-auth",
                  },
                });
                if (eres.ok) {
                  const list = (await eres.json()) as {
                    email: string;
                    primary?: boolean;
                    verified?: boolean;
                  }[];
                  const pick = list.find((e) => e.primary) ?? list[0];
                  email = pick?.email;
                  emailVerified = Boolean(pick?.verified);
                }
              }

              const id = String(profile.id);
              return {
                user: {
                  id,
                  name: profile.name || profile.login || "",
                  email: email ?? `oauth-github-${id}@placeholder.local`,
                  image: profile.avatar_url,
                  emailVerified,
                },
                data: profile,
              };
            },
          },
        }
      : {}),
  },
  plugins: [
    username(),
    admin({
      adminUserIds: parseAdminUserIds(),
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});

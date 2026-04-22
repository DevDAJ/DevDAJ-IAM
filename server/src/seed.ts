import { auth } from "./auth";
import { countAuthUsers, updateUserRoleByEmail } from "./auth/user-queries";
import { createScopeDefinition, listScopeDefinitions } from "./db";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export async function runStartupSeed(): Promise<void> {
  await seedDefaultScopes();
  await seedAdminUser();
}

async function seedDefaultScopes(): Promise<void> {
  if ((await listScopeDefinitions()).length > 0) return;
  const defaults = [
    { key: "app:basic", label: "Basic access", description: "Default app access" },
    { key: "app:pro", label: "Pro tier", description: "Pro subscription features" },
    {
      key: "integration:read",
      label: "Read integrations",
      description: "Read connected integration data",
    },
    { key: "integration:write", label: "Write integrations", description: "Modify integrations" },
  ];
  for (const d of defaults) {
    await createScopeDefinition(d);
  }
}

/** Optional: first user via HTTP sign-up + promote to admin (uses Origin header for Better Auth checks). */
async function seedAdminUser(): Promise<void> {
  if ((await countAuthUsers()) > 0) return;

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email?.trim() || !password) return;

  const headers = new Headers({
    "content-type": "application/json",
    origin: new URL(baseURL).origin,
  });
  try {
    await auth.api.signUpEmail({
      body: {
        email: email.trim(),
        password,
        name: "Administrator",
      },
      headers,
    });
  } catch (e) {
    console.warn("[seed] Could not create admin user:", e);
    return;
  }

  await updateUserRoleByEmail(email.trim(), "admin");
  console.info("[seed] Initial admin user created from SEED_ADMIN_EMAIL.");
}

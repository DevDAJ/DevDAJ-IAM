import type { Session, User } from "better-auth/types";

export function parseAdminUserIds(): string[] {
  const raw = process.env.ADMIN_USER_IDS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminUser(user: User): boolean {
  const roles = (user.role ?? "user").split(",").map((r) => r.trim());
  if (roles.includes("admin")) return true;
  return parseAdminUserIds().includes(user.id);
}

export type Authed = { session: Session; user: User };

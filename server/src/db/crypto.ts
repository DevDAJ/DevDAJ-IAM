import { createHash, randomBytes } from "node:crypto";

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey(): { raw: string; prefix: string } {
  const raw = `daj_${randomBytes(32).toString("base64url")}`;
  const prefix = raw.slice(0, 12);
  return { raw, prefix };
}

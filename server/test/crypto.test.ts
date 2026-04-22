import { describe, expect, test } from "bun:test";
import { generateApiKey, hashApiKey } from "../src/db/crypto";

describe("db/crypto", () => {
  test("hashApiKey is deterministic hex sha256", () => {
    const h = hashApiKey("secret-key");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(hashApiKey("secret-key")).toBe(h);
    expect(hashApiKey("other")).not.toBe(h);
  });

  test("generateApiKey returns daj_ prefix and stable prefix slice", () => {
    const a = generateApiKey();
    expect(a.raw.startsWith("daj_")).toBe(true);
    expect(a.prefix).toBe(a.raw.slice(0, 12));
    const b = generateApiKey();
    expect(b.raw).not.toBe(a.raw);
  });
});

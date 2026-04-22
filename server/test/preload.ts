import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = mkdtempSync(join(tmpdir(), "devdaj-iam-test-"));
process.env.AUTH_DATABASE_PATH = join(root, "auth.db");
process.env.APP_DATABASE_PATH = join(root, "app.db");

process.on("exit", () => {
  try {
    rmSync(root, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});

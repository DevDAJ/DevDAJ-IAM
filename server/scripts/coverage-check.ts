import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const proc = Bun.spawnSync(
  [
    "bun",
    "test",
    "--preload",
    "./test/preload.ts",
    "--max-concurrency=1",
    "--coverage",
    "./test",
  ],
  { cwd: root, stdout: "pipe", stderr: "pipe" },
);

const out = proc.stdout.toString();
const err = proc.stderr.toString();
const text = `${out}${err}`;
process.stdout.write(out);
if (err) process.stderr.write(err);

if (proc.exitCode !== 0) {
  process.exit(proc.exitCode ?? 1);
}

const esc = String.fromCharCode(0x1b);
const stripAnsi = (s: string) => s.replace(new RegExp(`${esc}\\[[0-9;]*m`, "g"), "");
let funcPct = -1;
let linePct = -1;
for (const raw of text.split("\n")) {
  const line = stripAnsi(raw).trim();
  if (!line.startsWith("All files")) continue;
  const cells = line.split("|").map((c) => c.trim());
  if (cells.length >= 3) {
    funcPct = Number(cells[1]);
    linePct = Number(cells[2]);
  }
  break;
}
if (funcPct < 0 || linePct < 0 || Number.isNaN(funcPct) || Number.isNaN(linePct)) {
  console.error("coverage-check: could not parse summary row");
  process.exit(1);
}
const min = 80;
if (funcPct < min || linePct < min) {
  console.error(
    `coverage-check: aggregate coverage must be >= ${min}% (funcs=${funcPct}%, lines=${linePct}%)`,
  );
  process.exit(1);
}

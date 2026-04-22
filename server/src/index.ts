import { createIamApp } from "./app";
import { initAppDatabase } from "./db";
import { runStartupSeed } from "./seed";

await initAppDatabase();
await runStartupSeed();

const port = Number(process.env.PORT ?? 3000);

createIamApp().listen({ port, hostname: "0.0.0.0" });

console.info(`IAM API listening on http://localhost:${port}`);

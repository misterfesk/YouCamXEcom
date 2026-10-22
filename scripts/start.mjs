import { cp } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

await Promise.all([
  cp("public", ".next/standalone/public", { recursive: true }),
  cp(".next/static", ".next/standalone/.next/static", { recursive: true }),
]);
process.env.HOSTNAME ??= "0.0.0.0";
await import(pathToFileURL(resolve(".next/standalone/server.js")).href);

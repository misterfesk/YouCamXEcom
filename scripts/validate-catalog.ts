// Run with: node scripts/validate-catalog.ts
import { readFileSync } from "node:fs";
import { register } from "node:module";

register("./ts-resolve.mjs", import.meta.url);
const { catalogSchema } = await import("../src/lib/catalog/schema");

const file = new URL("../data/products.json", import.meta.url);
const result = catalogSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));

if (!result.success) {
  console.error("data/products.json is invalid:");
  for (const issue of result.error.issues) {
    const [index, ...rest] = issue.path;
    console.error(`  product #${String(index)} ${rest.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}
console.log(`catalog ok: ${result.data.length} products`);

// Full-page screenshots of one or more routes at desktop and mobile widths.
// Usage: pnpm shots <outDir> [path ...]   (needs the app running; BASE_URL defaults to localhost:3000)
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const [outDir, ...paths] = process.argv.slice(2);
if (!outDir) {
  console.error("Usage: pnpm shots <outDir> [path ...]");
  process.exit(1);
}
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const widths = [1440, 390];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
for (const path of paths.length ? paths : ["/styleguide"]) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    const name = (path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home") + `-${width}.png`;
    await page.screenshot({ path: join(outDir, name), fullPage: true });
    console.log(join(outDir, name));
    await page.close();
  }
}
await browser.close();

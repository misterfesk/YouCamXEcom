import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";

const outDir = process.argv[2];
if (!outDir) throw new Error("Usage: pnpm submission:shots <output-directory>");
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().filter((animation) =>
      animation.effect?.getComputedTiming().iterations !== Infinity,
    ).map((animation) => animation.finished.catch(() => {})));
  });
}

try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } });
    const blocked = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/scan**", (route) => {
      blocked.push(route.request().url());
      return route.abort();
    });
    const capture = async (name) => {
      await settle(page);
      const path = join(outDir, `${name}-${width}.png`);
      await page.screenshot({ path });
      console.log(path);
    };
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "✦ Scan my skin", exact: true }).first().click();
    await page.getByRole("button", { name: "Try with a sample face", exact: true }).click();
    await page.getByRole("button", { name: "Try breakouts & oil sample", exact: true }).click();
    await page.locator(".goal-result").first().waitFor();
    await page.waitForFunction(() => document.querySelector(".reveal-photo img")?.naturalWidth > 0);
    await capture("scan-reveal");
    await page.locator(".goal-results").evaluate((element) => element.scrollIntoView({ block: "center" }));
    await capture("scan-goals");
    await page.getByRole("button", { name: "✦ Continue with recommendations", exact: true }).click();
    await page.waitForURL("**/shop");
    const forYou = page.getByRole("button", { name: "For you", exact: true });
    await forYou.waitFor();
    assert.equal(await forYou.getAttribute("aria-pressed"), "true");
    const catalogCards = page.locator("main .product-card-link:visible");
    // A product can appear in several concern shelves; the complete catalog stays available.
    await expect.poll(async () => new Set(await catalogCards.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    )).size).toBe(60);
    await page.locator(".store-notice").waitFor({ state: "hidden" });
    await page.locator(".catalog-view-switch").evaluate((element) => element.scrollIntoView({ block: "start" }));
    await capture("catalog-for-you");
    await catalogCards.first().evaluate((element) => (element.closest("section") ?? element).scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -16));
    await capture("catalog-matches");
    await catalogCards.first().click();
    await page.locator(".pdp-fit .fit-badge").waitFor();
    await capture("product");
    const why = page.getByText("Why this fits you", { exact: true });
    if (!(await why.evaluate((element) => element.parentElement.open))) await why.click();
    if (width === 1440) {
      await page.setViewportSize({ width, height: 1400 });
      await page.evaluate(() => window.scrollTo(0, 0));
    } else {
      await why.evaluate((element) => element.scrollIntoView({ block: "start" }));
    }
    await capture("product-reasoning");
    assert.deepEqual(blocked, [], "Sample screenshots must never request scan APIs");
    assert.deepEqual(errors, [], "Screenshot journey must have no browser errors");
    await page.close();
  }
} finally {
  await browser.close();
}

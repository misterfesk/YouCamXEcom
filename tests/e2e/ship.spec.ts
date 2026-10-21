import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const scanButton = (page: Page) => page.getByRole("button", { name: "✦ Scan my skin", exact: true }).first();

async function upload(page: Page) {
  await scanButton(page).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "✦ Upload photo", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles("public/samples/oily.jpg");
  await expect(page.locator(".scan-photo img")).toBeVisible();
  await page.getByRole("button", { name: "✦ Use this photo", exact: true }).click();
}

test("mock upload pipeline reports the configured provider outcome", async ({ page }) => {
  await page.goto("/");
  await upload(page);
  const scenario = process.env.YOUCAM_MOCK_SCENARIO ?? "success";
  if (scenario === "success") {
    await expect(page.locator(".goal-result")).toHaveCount(3);
    await page.getByRole("button", { name: "✦ Continue with recommendations", exact: true }).click();
    await expect(page).toHaveURL(/\/shop$/);
    const saved = await page.evaluate(() => localStorage.getItem("skin"));
    expect(saved).not.toMatch(/blob:|data:image|maskUrl/);
  } else {
    await expect(page.getByRole("heading", { name: scenario === "unavailable" ? "A little pause for the scanner" : "A little closer" })).toBeVisible();
    await expect(page.getByRole("dialog")).not.toContainText(/YouCamError|stack trace|fileId|mock\./);
    await page.getByRole("button", { name: /sample face/i }).click();
    await expect(page.getByRole("button", { name: "Try breakouts & oil sample", exact: true })).toBeVisible();
  }
});

test("closing during image processing cannot retain or revive a photo", async ({ page }) => {
  await page.goto("/");
  await scanButton(page).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "✦ Upload photo", exact: true }).click();
  await page.evaluate(() => {
    const original = window.createImageBitmap.bind(window);
    window.createImageBitmap = ((...args: Parameters<typeof createImageBitmap>) =>
      new Promise<ImageBitmap>((resolve, reject) => {
        Object.assign(window, { finishPhoto: () => original(...args).then(resolve, reject) });
      })) as typeof createImageBitmap;
    const create = URL.createObjectURL.bind(URL);
    Object.assign(window, { photoUrls: [] });
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      (window as unknown as { photoUrls: string[] }).photoUrls.push(url);
      return url;
    };
  });
  await page.locator('input[type="file"]').setInputFiles("public/samples/oily.jpg");
  await expect.poll(() => page.evaluate(() => "finishPhoto" in window)).toBe(true);
  await page.keyboard.press("Escape");
  await page.evaluate(() => (window as unknown as { finishPhoto: () => Promise<void> }).finishPhoto());
  await scanButton(page).click();
  await expect(page.getByRole("heading", { name: "Find care for your skin" })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { photoUrls: string[] }).photoUrls)).toEqual([]);
});

test("key routes and personalized cards pass axe WCAG AA checks", async ({ page }) => {
  for (const route of ["/", "/shop", "/products/soft-start-gel-cleanser", "/cart"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  }
  await page.goto("/shop");
  await scanButton(page).click();
  const modal = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(modal.violations, JSON.stringify(modal.violations, null, 2)).toEqual([]);
  await page.getByRole("button", { name: "Try with a sample face", exact: true }).click();
  await page.getByRole("button", { name: "Try breakouts & oil sample", exact: true }).click();
  await page.getByRole("button", { name: "✦ Continue with recommendations", exact: true }).click();
  await expect(page.locator('.product-card[data-unsuitable="true"]:visible').first()).toBeVisible();
  const personalized = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(personalized.violations, JSON.stringify(personalized.violations, null, 2)).toEqual([]);
});

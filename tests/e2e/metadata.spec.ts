import { expect, test } from "@playwright/test";
import { BRAND_NAME } from "../../src/config/site";

test("method and product links retain comfortable touch targets", async ({ page }) => {
  for (const path of ["/how-we-recommend", "/products/soft-start-gel-cleanser"]) {
    await page.goto(path);
    const small = await page.locator("main a[href]:visible, main button:visible").evaluateAll((elements) => elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width < 44 || rect.height < 44;
    }).map((element) => element.textContent));
    expect(small).toEqual([]);
  }
});

test("public metadata and demo Product data are consistent", async ({ page, request, baseURL }) => {
  await page.goto("/products/soft-start-gel-cleanser");
  await expect(page).toHaveTitle(`Soft Start Gel Cleanser | ${BRAND_NAME}`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/products\/soft-start-gel-cleanser$/);
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute("content", /\/opengraph-image/);
  const product = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
  expect(product).toMatchObject({ "@type": "Product", name: "Soft Start Gel Cleanser" });
  expect(product.description).toContain("Fictional demo product");
  expect(product).not.toHaveProperty("aggregateRating");
  expect(product).not.toHaveProperty("offers");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect((await sitemap.text()).match(/<loc>/g)).toHaveLength(74);
  expect(await sitemap.text()).not.toMatch(/\/checkout|\/cart|\/styleguide/);
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /api/");
  const image = await request.get(new URL("/opengraph-image", baseURL).href);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
  expect(await page.evaluate(async () => {
    const response = await fetch("/_next/image?url=%2Fimages%2Fskin-campaign.webp&w=384&q=75");
    const bitmap = await createImageBitmap(await response.blob());
    const width = bitmap.width;
    bitmap.close();
    return width;
  })).toBe(384);
  await page.goto("/checkout");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

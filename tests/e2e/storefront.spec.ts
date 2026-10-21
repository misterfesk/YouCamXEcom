import { expect, test, type Page, type Locator } from "@playwright/test";

async function activate(page: Page, target: Locator) {
  const menuItem = (await target.getAttribute("role")) === "menuitem";
  for (let index = 0; index < 240; index++) {
    if (await target.evaluate((element) => element === document.activeElement))
      break;
    await page.keyboard.press(menuItem ? "ArrowDown" : "Tab");
  }
  await expect(target).toBeFocused();
  await page.keyboard.press("Enter");
}
async function sampleScan(page: Page) {
  const start = page
    .getByRole("button", { name: "✦ Scan my skin", exact: true })
    .first();
  await activate(page, start);
  await expect(
    page.getByRole("dialog", { name: "Find care for your skin" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "✦ Use camera", exact: true }),
  ).toBeDisabled();
  await activate(
    page,
    page.getByRole("button", { name: "Try with a sample face", exact: true }),
  );
  await activate(
    page,
    page.getByRole("button", {
      name: "Try breakouts & oil sample",
      exact: true,
    }),
  );
  await expect(
    page.getByText("Replaying a recorded sample", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".goal-result")).toHaveCount(3);
  const nextGoal = page.locator(".goal-result").nth(1);
  await activate(page, nextGoal);
  await expect(nextGoal).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".concern-overlay").first()).toHaveCSS(
    "mask-image",
    /oiliness|pore/,
  );
  await activate(
    page,
    page.getByRole("button", {
      name: "✦ Continue with recommendations",
      exact: true,
    }),
  );
}

test("keyboard journey from sample scan to demo order", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await sampleScan(page);
  await expect(page).toHaveURL(/\/shop$/);
  await expect(
    page.getByRole("button", { name: "For you", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const product = page.locator(".product-card-link").first();
  await activate(page, product);
  await expect(page).toHaveURL(/\/products\//);
  await expect(page.locator(".pdp-fit .fit-badge")).toBeVisible();
  await activate(
    page,
    page.getByRole("button", { name: /^Add to bag/ }).first(),
  );
  await activate(
    page,
    page.getByRole("link", { name: "Bag, 1 item", exact: true }),
  );
  await page.getByRole("combobox", { name: /^Quantity for/ }).selectOption("2");
  await expect(
    page.getByRole("link", { name: "Bag, 2 items", exact: true }),
  ).toBeVisible();
  await activate(
    page,
    page.getByRole("link", { name: "Continue to demo checkout" }),
  );
  await expect(
    page.getByText("This is a demo checkout.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("First name").fill("Alex");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByRole("checkbox").check();
  await activate(
    page,
    page.getByRole("button", { name: "Place demo order", exact: true }),
  );
  await expect(page).toHaveURL(/\/order-confirmation$/);
  await expect(
    page.getByText("Your demo order is complete.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Bag, 0 items", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".confirmation-items li")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("scan stays optional and reopened results contain no photo", async ({
  page,
}) => {
  await page.goto("/");
  await sampleScan(page);
  const mobileProfile = page.getByRole("button", {
    name: "Open skin profile",
    exact: true,
  });
  await activate(
    page,
    (await mobileProfile.isVisible())
      ? mobileProfile
      : page.locator(".profile-chip"),
  );
  await activate(page, page.getByText("View my results", { exact: true }));
  await expect(
    page.getByRole("img", {
      name: "Illustrated face map; your photo is no longer kept",
    }),
  ).toBeVisible();
  await expect(page.locator(".reveal-photo img")).toHaveCount(0);
  await activate(
    page,
    page.getByRole("button", {
      name: "Continue without recommendations",
      exact: true,
    }),
  );
  await expect(
    page.getByRole("button", { name: "For you", exact: true }),
  ).toBeHidden();
  await expect(page.locator(".fit-badge")).toHaveCount(0);
  await activate(
    page,
    (await mobileProfile.isVisible())
      ? mobileProfile
      : page.locator(".profile-chip"),
  );
  await activate(page, page.getByText("Delete my results", { exact: true }));
  await expect(page.locator(".profile-chip")).toHaveCount(0);
});

test("local uploads validate and closing discards the photo", async ({
  page,
}) => {
  await page.goto("/");
  const start = page
    .getByRole("button", { name: "✦ Scan my skin", exact: true })
    .first();
  await activate(page, start);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "✦ Upload photo", exact: true })
    .click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "tiny.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(
    page.getByRole("heading", {
      name: "A clearer photo will help",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "✦ Upload another", exact: true })
    .click();
  await page
    .locator('input[type="file"]')
    .setInputFiles("public/samples/oily.jpg");
  const preview = page.locator(".scan-photo img");
  await expect(preview).toHaveAttribute("src", /^blob:/);
  const source = await preview.getAttribute("src");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(async (url) => {
      try {
        await fetch(url!);
        return false;
      } catch {
        return true;
      }
    }, source),
  ).toBe(true);
  await activate(page, start);
  await expect(page.locator(".scan-photo img")).toHaveCount(0);
});

test("search supports terms, synonyms and keyboard focus return", async ({
  page,
}) => {
  await page.goto("/shop");
  const trigger = page.getByRole("button", {
    name: "Search products",
    exact: true,
  });
  await activate(page, trigger);
  const search = page.getByRole("searchbox", {
    name: "Search the collection",
    exact: true,
  });
  await expect(search).toBeFocused();
  await search.fill("pimples");
  await expect(
    page.getByRole("link", { name: /Balance Notes Serum/ }),
  ).toBeVisible();
  await search.fill("niacinamde");
  await expect(
    page.getByRole("link", { name: /Balance Notes Serum/ }),
  ).toBeVisible();
  await search.fill("Sheer Veil Tinted SPF 50");
  await expect(
    page.getByRole("link", { name: /Sheer Veil Tinted SPF 50/ }),
  ).toBeVisible();
  await search.fill("nothing matches this");
  await expect(
    page.getByRole("heading", { name: "A different word might help." }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("tablet and reduced motion retain the shopping journey", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await sampleScan(page);
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 768);
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 768);
  const transforms = await page
    .locator(".product-grid > li")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
  expect(transforms.every((value) => value === "none")).toBe(true);
});

test("For you keeps the complete catalog available for every sample", async ({
  page,
}) => {
  for (const label of [
    "breakouts & oil",
    "dehydration & redness",
    "under-eyes & firmness",
  ]) {
    await page.goto("/shop");
    const links = page.locator(".product-card-link");
    const expected = (
      await links.evaluateAll((elements) =>
        elements.map((el) => el.getAttribute("href")),
      )
    ).sort();
    expect(expected).toHaveLength(24);
    await page
      .getByRole("button", { name: "✦ Scan my skin", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Try with a sample face", exact: true })
      .click();
    await page
      .getByRole("button", { name: `Try ${label} sample`, exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "✦ Continue with recommendations",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", { name: "For you", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    const available = [
      ...new Set(
        await links.evaluateAll((elements) =>
          elements.map((el) => el.getAttribute("href")),
        ),
      ),
    ].sort();
    expect(available).toEqual(expected);
  }
});

test("unknown catalog URLs render the branded not-found page", async ({
  page,
}) => {
  for (const route of [
    "/products/not-a-product",
    "/shop/not-a-step",
    "/concerns/not-a-goal",
  ]) {
    const response = await page.goto(route);
    expect([200, 404]).toContain(response?.status());
    await expect(
      page.getByText("404 / A small detour", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Shop the collection", exact: true }),
    ).toBeVisible();
  }
});

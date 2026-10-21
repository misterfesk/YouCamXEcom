import { expect, test, type Locator, type Page } from "@playwright/test";

async function tabTo(page: Page, target: Locator) {
  for (let index = 0; index < 600; index++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    const backwards = await target.evaluate(
      (element) =>
        !!(
          element.compareDocumentPosition(document.activeElement!) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ),
    );
    await page.keyboard.press(backwards ? "Shift+Tab" : "Tab");
  }
  throw new Error(
    `Control not reachable by Tab: ${await target.textContent()}`,
  );
}

test("styleguide overlays and menus work entirely from the keyboard", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/styleguide", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await expect(page.locator("html")).toHaveJSProperty("scrollWidth", width);

    const modalTrigger = page.getByRole("button", {
      name: "Open modal",
      exact: true,
    });
    await tabTo(page, modalTrigger);
    await page.keyboard.press("Enter");
    const modal = page.getByRole("dialog", { name: "A little more detail" });
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("button", { name: "Go back" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(
      modal.getByRole("button", { name: "Cancel", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(modal.getByRole("button", { name: "Go back" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(modalTrigger).toBeFocused();

    const sheetTrigger = page.getByRole("button", {
      name: "Open bottom sheet",
      exact: true,
    });
    await tabTo(page, sheetTrigger);
    await page.keyboard.press("Space");
    const sheet = page.getByRole("dialog", { name: "Your preferences" });
    await expect(
      sheet.getByRole("button", { name: "Close your preferences" }),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(
      sheet.getByRole("button", { name: "Save preferences" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(sheetTrigger).toBeFocused();

    const menuTrigger = page.getByRole("button", { name: "Browse specimens" });
    await tabTo(page, menuTrigger);
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("menu", { name: "Specimen navigation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Unavailable destination" }),
    ).not.toHaveAttribute("href");
    await page.keyboard.press("End");
    await expect(
      page.getByRole("menuitem", { name: "Try a menu action" }),
    ).toBeFocused();
    await page.keyboard.press("Home");
    await expect(
      page.getByRole("menuitem", { name: "Color foundations" }),
    ).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(
      page.getByRole("menuitem", { name: "Typography", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menuTrigger).toBeFocused();

    const scanTrigger = page
      .locator("main")
      .getByRole("button", { name: "✦ Scan my skin", exact: true })
      .first();
    await tabTo(page, scanTrigger);
    await expect(scanTrigger).toHaveCSS("outline-color", "rgb(28, 63, 214)");
    await expect(scanTrigger).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("dialog", { name: "Meet your skin" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(scanTrigger).toBeFocused();
  }
  expect(errors).toEqual([]);
});

test("tokens render correctly and reduced motion preserves the re-sort", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/styleguide", { waitUntil: "networkidle" });
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  const scan = page
    .getByRole("button", { name: "✦ Scan my skin", exact: true })
    .first();
  await expect(scan).toHaveCSS("--border-width-strong", "1.5px");
  expect(
    Number.parseFloat(
      await scan.evaluate(
        (element) => getComputedStyle(element).borderTopWidth,
      ),
    ),
  ).toBeGreaterThanOrEqual(1);
  await expect(page.locator(".accent").first()).toHaveCSS(
    "font-family",
    /Bodoni/,
  );
  const badSizes = await page
    .locator(
      "main button:not(:disabled), main a[href], main input:not(:disabled)",
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.width > 0 &&
            box.height > 0 &&
            (box.width < 44 || box.height < 44)
          );
        })
        .map((element) => element.outerHTML),
    );
  expect(badSizes).toEqual([]);

  const sort = page.getByRole("button", { name: "Sort for sample skin" });
  await tabTo(page, sort);
  await page.keyboard.press("Space");
  await expect(page.locator(".product-specimen h3")).toHaveText([
    "Daily serum",
    "Daily sunscreen",
    "Gentle cleanser",
    "Barrier moisturiser",
  ]);
  await expect(page.locator(".resort-highlight").first()).toHaveCSS(
    "opacity",
    "0",
  );
  await expect(
    page.getByRole("button", { name: "Reset catalog order" }),
  ).toBeFocused();
  const hydrating = page.getByRole("button", {
    name: "Hydrating",
    exact: true,
  });
  await tabTo(page, hydrating);
  await page.keyboard.press("Space");
  await expect(hydrating).toHaveAttribute("aria-pressed", "false");
});

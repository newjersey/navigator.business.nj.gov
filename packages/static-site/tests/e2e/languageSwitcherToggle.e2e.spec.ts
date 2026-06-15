import { expect, test } from "@playwright/test";

/**
 * Verifies the language dropdown opens on the trigger and closes again both
 * when the trigger is re-clicked and when the visitor clicks outside it.
 *
 * Open/close is driven by the bundled NJWDS language-selector script, so this
 * must run in a real browser rather than jsdom.
 */

const TRIGGER = "nav.usa-language button.usa-language__link";
const SUBMENU = "#language-switcher-submenu";

test.describe("language switcher open/close", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/learn");
  });

  test("opens the dropdown when the trigger is clicked", async ({ page }) => {
    const trigger = page.locator(TRIGGER);
    const submenu = page.locator(SUBMENU);

    await expect(submenu).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();

    await expect(submenu).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("closes the dropdown when the trigger is clicked again", async ({ page }) => {
    const trigger = page.locator(TRIGGER);
    const submenu = page.locator(SUBMENU);

    await trigger.click();
    await expect(submenu).toBeVisible();

    await trigger.click();

    await expect(submenu).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("closes the dropdown when clicking outside it", async ({ page }) => {
    const trigger = page.locator(TRIGGER);
    const submenu = page.locator(SUBMENU);

    await trigger.click();
    await expect(submenu).toBeVisible();

    // Click a neutral region of the page away from the switcher.
    await page.locator("#main-content").click({ position: { x: 5, y: 5 } });

    await expect(submenu).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

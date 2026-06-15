import { expect, test } from "@playwright/test";

/**
 * Verifies the language submenu only scrolls when more than six options exist.
 *
 * Uses the test-only harness route, which renders a single switcher with a
 * controlled option count via `?count=`. Scroll presence is measured in a real
 * browser (jsdom has no layout), comparing scrollHeight against clientHeight.
 */

const HARNESS_SUBMENU = "#harness-language-switcher-submenu";

/**
 * Opens the harness switcher at a given option count and returns scroll metrics.
 */
const measureSubmenuAtCount = async (
  page: import("@playwright/test").Page,
  count: number,
): Promise<{ optionCount: number; isScrolling: boolean }> => {
  await page.goto(`/language-switcher-harness?count=${count}`);
  await page.locator("#main-content nav.usa-language button").click();

  const submenu = page.locator(HARNESS_SUBMENU);
  await expect(submenu).toBeVisible();

  return submenu.evaluate((element) => {
    return {
      optionCount: element.querySelectorAll(".usa-language__submenu-item").length,
      isScrolling: element.scrollHeight > element.clientHeight,
    };
  });
};

test.describe("language switcher scroll behavior", () => {
  test("shows two options without a scrollbar", async ({ page }) => {
    const { optionCount, isScrolling } = await measureSubmenuAtCount(page, 2);

    expect(optionCount).toBe(2);
    expect(isScrolling).toBe(false);
  });

  test("shows six options without a scrollbar", async ({ page }) => {
    const { optionCount, isScrolling } = await measureSubmenuAtCount(page, 6);

    expect(optionCount).toBe(6);
    expect(isScrolling).toBe(false);
  });

  test("shows a scrollbar when more than six options are present", async ({ page }) => {
    const { optionCount, isScrolling } = await measureSubmenuAtCount(page, 7);

    expect(optionCount).toBe(7);
    expect(isScrolling).toBe(true);
  });
});

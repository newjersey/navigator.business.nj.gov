import { expect, test } from "@playwright/test";

/**
 * Verifies behavior when NEXT_PUBLIC_MULTILINGUAL_ENABLED is false:
 * - Only English URLs are served; non-English paths return 404.
 * - The language switcher nav is absent from the page.
 * - The preferred-language prompt modal never appears, even for Spanish-
 *   preferring browsers.
 */

test.describe("English-only mode", () => {
  test("homepage is served in English", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  });

  test("language switcher nav is not rendered", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav.usa-language")).toHaveCount(0);
  });

  test("/es-US returns 404", async ({ page }) => {
    const response = await page.goto("/es-US");
    expect(response?.status()).toBe(404);
  });

  test("/es-US/learn returns 404", async ({ page }) => {
    const response = await page.goto("/es-US/learn");
    expect(response?.status()).toBe(404);
  });

  test.describe("with a Spanish-preferring browser", () => {
    test.use({ locale: "es-ES" });

    test("language prompt modal never appears", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("#language-prompt-modal")).toHaveCount(0);
    });
  });
});

import { expect, test } from "@playwright/test";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";

/**
 * Verifies that choosing a language re-targets the current page in that
 * language: the locale prefix appears in the URL, the path is preserved, and
 * the document `lang` (and `dir`, for RTL languages) plus visible content
 * change to the destination locale.
 */

const TRIGGER = "nav.usa-language button.usa-language__link";
const SUBMENU = "#language-switcher-submenu";

const openSwitcherAndChoose = async (
  page: import("@playwright/test").Page,
  hrefLang: string,
): Promise<void> => {
  await page.locator(TRIGGER).click();
  await expect(page.locator(SUBMENU)).toBeVisible();
  await page.locator(`${SUBMENU} a[hreflang="${hrefLang}"]`).click();
};

test.describe("language switcher redirect", () => {
  test.beforeEach(async ({ context }) => {
    // Suppress the preferred-language prompt modal so its overlay never covers
    // the post-switch page content this suite asserts on.
    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3100",
      },
    ]);
  });

  test("switches to Spanish: URL prefix, preserved path, lang and content change", async ({
    page,
  }) => {
    const englishHero = getApplicationMessages({ locale: "en-US" }).landing.hero.title;
    const spanishHero = getApplicationMessages({ locale: "es-US" }).landing.hero.title;

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: englishHero })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    await openSwitcherAndChoose(page, "es-US");

    await expect(page).toHaveURL(/\/es-US$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-US");
    await expect(page.getByRole("heading", { level: 1, name: spanishHero })).toBeVisible();
  });

  test("preserves a nested path when switching language", async ({ page }) => {
    await page.goto("/learn");

    await openSwitcherAndChoose(page, "es-US");

    await expect(page).toHaveURL(/\/es-US\/learn$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-US");
  });

  // Skipped while no RTL locale ships. The switcher's dir-flip behavior is still
  // wired (textDirectionForLocale + dir on <html>); restore this test by adding
  // an RTL language such as ar-US back to APP_LOCALES and LANGUAGE_DESCRIPTORS.
  test.skip("switches to Arabic and flips the document direction to rtl", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    await openSwitcherAndChoose(page, "ar-US");

    await expect(page).toHaveURL(/\/ar-US\/learn$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar-US");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });
});

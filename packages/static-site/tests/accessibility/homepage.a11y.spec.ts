import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "playwright";
import type { AppLocale } from "@/domain/i18n/locales";
import { APP_LOCALES } from "@/domain/i18n/locales";
import { loadLandingContentFromMessages } from "@/domain/landing/loadLandingContent";

/**
 * Defines the test context provided by Playwright.
 */
interface AccessibilityTestContext {
  /** Browser page used by the test run. */
  readonly page: Page;
}

/**
 * Parameters for creating one locale-specific accessibility test.
 */
interface CreateLocaleAccessibilityTestParams {
  /** Locale to evaluate in the browser accessibility audit. */
  readonly locale: AppLocale;
}

/**
 * Creates a Playwright accessibility test for one locale.
 */
const createLocaleAccessibilityTest = ({ locale }: CreateLocaleAccessibilityTestParams) => {
  return async ({ page }: AccessibilityTestContext) => {
    const loadedLandingContent = await loadLandingContentFromMessages({ locale });

    await page.goto(`/${locale}`);
    await page
      .getByRole("heading", { level: 1, name: loadedLandingContent.landing.hero.title })
      .waitFor();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  };
};

for (const locale of APP_LOCALES) {
  test(
    `landing page has no automated WCAG violations for ${locale}`,
    createLocaleAccessibilityTest({ locale }),
  );
}

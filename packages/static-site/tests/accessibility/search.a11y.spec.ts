import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "playwright";

import type { AppLocale } from "@/domain/i18n/locales";
import { APP_LOCALES } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

/**
 * Defines the test context provided by Playwright.
 */
interface AccessibilityTestContext {
  /** Browser page used by the test run. */
  readonly page: Page;
}

/**
 * Parameters for creating one locale-specific search accessibility test.
 */
interface CreateSearchAccessibilityTestParams {
  /** Locale to evaluate in the browser accessibility audit. */
  readonly locale: AppLocale;
}

/**
 * Creates a Playwright accessibility test for one locale's search page.
 */
const createSearchAccessibilityTest = ({ locale }: CreateSearchAccessibilityTestParams) => {
  return async ({ page }: AccessibilityTestContext) => {
    const applicationMessages = getApplicationMessages({ locale });

    await page.goto(`/${locale}/search?q=business`);
    await page
      .getByRole("heading", { level: 1, name: applicationMessages.search.pageTitle })
      .waitFor();
    await page.locator(".search-results-list .search-result").first().waitFor();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  };
};

for (const locale of APP_LOCALES) {
  test(
    `search page has no automated WCAG violations for ${locale}`,
    createSearchAccessibilityTest({ locale }),
  );
}

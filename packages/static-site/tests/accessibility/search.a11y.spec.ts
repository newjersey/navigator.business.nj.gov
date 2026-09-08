import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { BrowserContext, Page } from "playwright";
import type { AppLocale } from "@/domain/i18n/locales";
import { ENABLED_LOCALES } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";

/**
 * Defines the test context provided by Playwright.
 */
interface AccessibilityTestContext {
  /** Browser page used by the test run. */
  readonly page: Page;
  /** Browser context, used to seed cookies before navigation. */
  readonly context: BrowserContext;
}

/**
 * Parameters for creating one locale-specific accessibility test.
 */
interface CreateLocaleAccessibilityTestParams {
  /** Locale to evaluate in the browser accessibility audit. */
  readonly locale: AppLocale;
}

/**
 * Creates a Playwright accessibility test for the search results page, with
 * real results loaded from the generated pagefind index.
 */
const createSearchResultsAccessibilityTest = ({ locale }: CreateLocaleAccessibilityTestParams) => {
  return async ({ page, context }: AccessibilityTestContext) => {
    const messages = await getApplicationMessages({ locale });

    await context.addCookies([
      { name: LANGUAGE_PROMPT_DISMISSED_COOKIE, value: "true", url: "http://127.0.0.1:3000" },
    ]);

    await page.goto(`/${locale}/search?q=funding`);
    await page
      .getByRole("heading", {
        level: 1,
        name: messages.search.resultsHeading.replace("{query}", "funding"),
      })
      .waitFor();
    // Wait for the loading state to resolve into either results or an error,
    // so the audit runs against the settled DOM.
    await page.getByText(messages.search.loadingLabel).waitFor({ state: "detached" });

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  };
};

/**
 * Creates a Playwright accessibility test for the search page's no-query
 * state.
 */
const createNoQueryAccessibilityTest = ({ locale }: CreateLocaleAccessibilityTestParams) => {
  return async ({ page, context }: AccessibilityTestContext) => {
    const messages = await getApplicationMessages({ locale });

    await context.addCookies([
      { name: LANGUAGE_PROMPT_DISMISSED_COOKIE, value: "true", url: "http://127.0.0.1:3000" },
    ]);

    await page.goto(`/${locale}/search`);
    await page.getByText(messages.search.noQueryBody).waitFor();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  };
};

for (const locale of ENABLED_LOCALES) {
  test(
    `search results page has no automated WCAG violations for ${locale}`,
    createSearchResultsAccessibilityTest({ locale }),
  );
  test(
    `search page's no-query state has no automated WCAG violations for ${locale}`,
    createNoQueryAccessibilityTest({ locale }),
  );
}

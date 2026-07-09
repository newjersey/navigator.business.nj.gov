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
 * Creates a Playwright accessibility test for one locale.
 */
const createLocaleAccessibilityTest = ({ locale }: CreateLocaleAccessibilityTestParams) => {
  return async ({ page, context }: AccessibilityTestContext) => {
    const { impactReport } = getApplicationMessages({ locale });

    // Suppress the preferred-language prompt modal so its open/animation state
    // cannot race with the axe scan, which made this audit flaky.
    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3000",
      },
    ]);

    await page.goto(`/${locale}/impact-report`);
    await page.getByRole("heading", { level: 1, name: impactReport.title }).waitFor();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  };
};

for (const locale of ENABLED_LOCALES) {
  test(
    `impact report page has no automated WCAG violations for ${locale}`,
    createLocaleAccessibilityTest({ locale }),
  );
}

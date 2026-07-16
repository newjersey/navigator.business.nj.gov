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
 *
 * The audit covers the page shell only. The GovDelivery signup form renders in
 * a cross-origin iframe that axe cannot inspect and the site does not control.
 */
const createLocaleAccessibilityTest = ({ locale }: CreateLocaleAccessibilityTestParams) => {
  return async ({ page, context }: AccessibilityTestContext) => {
    const { newsletterSignup } = getApplicationMessages({ locale });

    // Suppress the preferred-language prompt modal so its open/animation state
    // cannot race with the axe scan, which made this audit flaky.
    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3000",
      },
    ]);

    await page.goto(`/${locale}/newsletter-signup`);
    await page.getByRole("heading", { level: 1, name: newsletterSignup.title }).waitFor();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  };
};

for (const locale of ENABLED_LOCALES) {
  test(
    `newsletter signup page has no automated WCAG violations for ${locale}`,
    createLocaleAccessibilityTest({ locale }),
  );
}

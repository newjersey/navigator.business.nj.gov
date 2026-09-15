import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { BrowserContext, Page } from "playwright";
import { loadPageBySlug } from "@/domain/content/loadContent";
import type { AppLocale } from "@/domain/i18n/locales";
import { ENABLED_LOCALES } from "@/domain/i18n/locales";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE, SITE_TITLE_SUFFIX } from "@/domain/siteConfig";

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

const page_ = loadPageBySlug("plastic-ban-law");

/** Heading of the first `collapsible-N: closed` section, used to exercise the accordion toggle. */
const closedAccordionHeading = Array.from({ length: 11 }, (_, i) => i + 1)
  .filter((index) => page_[`collapsible-${index}`] === "closed")
  .map((index) => page_[`heading-${index}`])
  .find((heading): heading is string => Boolean(heading));

if (!closedAccordionHeading) {
  throw new Error("plastic-ban-law content must author at least one collapsible-N: closed section");
}

/**
 * Creates a Playwright accessibility test for one locale.
 *
 * This page is the only content page with a collapsible accordion, so it runs
 * a second axe scan after expanding a closed panel to audit revealed content
 * too, not just the initial collapsed state.
 */
const createLocaleAccessibilityTest = ({ locale }: CreateLocaleAccessibilityTestParams) => {
  return async ({ page, context }: AccessibilityTestContext) => {
    // Suppress the preferred-language prompt modal so its open/animation state
    // cannot race with the axe scan, which made this audit flaky.
    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3000",
      },
    ]);

    await page.goto(`/${locale}/pages/plastic-ban-law`);
    await page.getByRole("heading", { level: 1, name: page_.name }).waitFor();
    await expect(page).toHaveTitle(`${page_.name} | ${SITE_TITLE_SUFFIX}`);

    // `color-contrast` is a pre-existing NJWDS banner/chrome issue present on
    // every page (it also fails the homepage audit) and is outside this page's
    // scope. Excluding it keeps this audit focused on this page's a11y.
    const initialResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(initialResults.violations).toEqual([]);

    await page.getByRole("button", { name: closedAccordionHeading }).click();
    await expect(page.getByRole("button", { name: closedAccordionHeading })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    const expandedResults = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    expect(expandedResults.violations).toEqual([]);
  };
};

for (const locale of ENABLED_LOCALES) {
  test(
    `plastic ban law page has no automated WCAG violations for ${locale}`,
    createLocaleAccessibilityTest({ locale }),
  );
}

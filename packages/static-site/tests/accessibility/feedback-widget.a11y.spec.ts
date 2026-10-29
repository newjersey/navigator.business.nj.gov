import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { BrowserContext, Page } from "playwright";
import { toFeedbackWidgetLanguage } from "@/domain/feedback/feedbackWidgetLanguage";
import { FEEDBACK_API_BASE_URL } from "@/domain/feedback/feedbackWidgetMode";
import type { AppLocale } from "@/domain/i18n/locales";
import { ENABLED_LOCALES } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";

const WIDGET_SELECTOR = "feedback-widget";
const PRIVACY_NOTICE_URL = "https://nj.gov/nj/privacy.shtml";

/**
 * Defines the test context provided by Playwright.
 */
interface FeedbackWidgetTestContext {
  /** Browser page used by the test run. */
  readonly page: Page;
  /** Browser context, used to seed cookies before navigation. */
  readonly context: BrowserContext;
}

/**
 * Parameters for creating one locale-specific feedback widget test.
 */
interface CreateLocaleFeedbackWidgetTestParams {
  /** Locale to exercise in the browser. */
  readonly locale: AppLocale;
}

/**
 * Scans only the widget so a violation points at the third-party markup
 * rather than the surrounding page.
 */
const expectNoWidgetViolations = async (page: Page): Promise<void> => {
  const results = await new AxeBuilder({ page }).include(WIDGET_SELECTOR).analyze();

  expect(results.violations).toEqual([]);
};

/**
 * The widget re-renders its markup when it receives the active language, so
 * interacting before that settles would target elements that are replaced.
 */
const waitForWidgetLanguage = async (page: Page, locale: AppLocale): Promise<void> => {
  const expectedLanguage = toFeedbackWidgetLanguage(locale);

  await expect
    .poll(() => {
      return page.evaluate((selector) => {
        return (document.querySelector(selector) as (HTMLElement & { language?: string }) | null)
          ?.language;
      }, WIDGET_SELECTOR);
    })
    .toBe(expectedLanguage);
};

/**
 * Walks the rating, comment, email, and confirmation steps against the
 * published widget bundle, with its network calls stubbed by mock mode.
 *
 * Selectors use the widget's own element IDs because its visible copy ships
 * inside the package rather than in this app's message files.
 */
const createLocaleFeedbackWidgetTest = ({ locale }: CreateLocaleFeedbackWidgetTestParams) => {
  return async ({ page, context }: FeedbackWidgetTestContext) => {
    const { layout } = getApplicationMessages({ locale });
    const feedbackApiRequests: string[] = [];

    page.on("request", (request) => {
      if (request.url().startsWith(FEEDBACK_API_BASE_URL)) {
        feedbackApiRequests.push(request.url());
      }
    });

    await context.addCookies([
      {
        name: LANGUAGE_PROMPT_DISMISSED_COOKIE,
        value: "true",
        url: "http://127.0.0.1:3000",
      },
    ]);

    await page.goto(`/${locale}`);

    const landmark = page.getByRole("region", { name: layout.feedbackAriaLabel });
    const widget = landmark.locator(WIDGET_SELECTOR);

    await expect(widget.locator("#yesButton")).toBeVisible();
    await waitForWidgetLanguage(page, locale);
    await expectNoWidgetViolations(page);

    await widget.locator("#yesButton").click();

    const commentField = widget.locator("#comment");

    await expect(commentField).toBeVisible();
    expect(
      await commentField.evaluate((field) => (field as HTMLTextAreaElement).labels?.length),
    ).toBe(1);
    await expectNoWidgetViolations(page);

    await commentField.fill("Automated accessibility check");
    await widget.locator("#commentSubmit").click();

    const emailField = widget.locator("#email");

    await expect(emailField).toBeVisible();
    await expect(widget.locator(`a[href="${PRIVACY_NOTICE_URL}"]`)).toBeVisible();
    await expectNoWidgetViolations(page);

    await emailField.fill("accessibility-check@example.com");
    await widget.locator("#emailSubmit").click();

    await expect(widget.locator("#confirmation")).toBeVisible();
    await expectNoWidgetViolations(page);

    expect(feedbackApiRequests).toEqual([]);
  };
};

for (const locale of ENABLED_LOCALES) {
  test(
    `feedback widget completes every step with no automated WCAG violations for ${locale}`,
    createLocaleFeedbackWidgetTest({ locale }),
  );
}

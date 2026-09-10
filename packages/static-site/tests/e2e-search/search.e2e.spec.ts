import { expect, test } from "@playwright/test";
import type { Page } from "playwright";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { LANGUAGE_PROMPT_DISMISSED_COOKIE } from "@/domain/siteConfig";

/**
 * End-to-end verification of the search feature against a real, freshly
 * generated Pagefind index (this suite's `webServer` runs a real
 * `pnpm build`, unlike every other Playwright config in this package — see
 * `playwright.e2e.search.config.ts`). Ticket 06 already verified this same
 * behavior manually against a real Docker container; this is that
 * verification made permanent and checked in.
 */

/** Waits for the results section to settle out of its transient loading state. */
const waitForSearchToSettle = async (page: Page, loadingLabel: string): Promise<void> => {
  await page.getByText(loadingLabel).waitFor({ state: "detached" });
};

/** Asserts at least one real result card rendered, with a highlighted excerpt. */
const expectRealHighlightedResults = async (page: Page): Promise<void> => {
  const resultCards = page.locator(".usa-card__container");
  await expect(resultCards.first()).toBeVisible();
  expect(await resultCards.count()).toBeGreaterThan(0);
  await expect(resultCards.first().locator("mark").first()).toBeVisible();
};

const searchFromHeaderLandsOnRealResults = async ({ page }: { page: Page }): Promise<void> => {
  const { layout, search } = getApplicationMessages({ locale: "en-US" });
  const query = "funding";

  await page.goto("/");
  await page.getByRole("searchbox", { name: layout.header.searchInputLabel }).fill(query);
  await page.getByRole("button", { name: layout.header.searchSubmitIconAlt }).click();

  await expect(page).toHaveURL(`/search?q=${query}`);
  await expect(
    page.getByRole("heading", { level: 1, name: search.resultsHeading.replace("{query}", query) }),
  ).toBeVisible();
  await waitForSearchToSettle(page, search.loadingLabel);
  await expectRealHighlightedResults(page);
};

const facetNarrowsResultsToOneType = async ({ page }: { page: Page }): Promise<void> => {
  const { search } = getApplicationMessages({ locale: "en-US" });
  const query = "funding";
  const learnPageLabel = search.typeLabels["Learn page"];

  await page.goto(`/search?q=${query}`);
  await waitForSearchToSettle(page, search.loadingLabel);
  const initialCount = await page.locator(".usa-card__container").count();

  // USWDS visually hides the native checkbox off-screen
  // (`.usa-checkbox__input { left: -999em }`) and renders the visible
  // custom box via its `<label>`'s `::before` — Playwright's actionability
  // check treats the input itself as permanently outside the viewport, so
  // click the real, visible `<label>` instead (native `for`/`id`
  // association toggles the checkbox exactly like a real user click would).
  await page.locator("aside").getByText(learnPageLabel, { exact: true }).click();
  await waitForSearchToSettle(page, search.loadingLabel);
  await expect(page.getByLabel(search.filteringByLabel)).toBeVisible();

  const filteredCards = page.locator(".usa-card__container");
  const filteredCount = await filteredCards.count();
  expect(filteredCount).toBeGreaterThan(0);
  expect(filteredCount).toBeLessThanOrEqual(initialCount);

  const visibleTags = await filteredCards.locator(".usa-tag").allTextContents();
  expect(visibleTags.every((tag) => tag === learnPageLabel)).toBe(true);
};

const nonsenseQueryRendersZeroResults = async ({ page }: { page: Page }): Promise<void> => {
  const { search } = getApplicationMessages({ locale: "en-US" });
  const query = "zzzznonexistentquerytermzzzz";

  await page.goto(`/search?q=${query}`);
  await waitForSearchToSettle(page, search.loadingLabel);

  await expect(
    page.getByRole("heading", { level: 2, name: search.zeroResultsTitle }),
  ).toBeVisible();
  await expect(page.getByText(search.zeroResultsBody)).toBeVisible();
};

const spanishSearchReturnsLocalizedResults = async ({ page }: { page: Page }): Promise<void> => {
  const locale: AppLocale = "es-US";
  const { layout, search } = getApplicationMessages({ locale });
  // Real Learn/Update/Funding body content is English-only (no translated
  // markdown source exists) — only UI chrome is localized (see
  // `messages/es-US.json`). "actualización" is the "Last Updated" label
  // every real Update page renders inside its indexed `data-pagefind-body`
  // region, so it is a genuine Spanish string Pagefind indexes across ~168
  // real Update documents, not a mocked value.
  const query = "actualización";

  await page.goto(`/${locale}`);
  await page.getByRole("searchbox", { name: layout.header.searchInputLabel }).fill(query);
  await page.getByRole("button", { name: layout.header.searchSubmitIconAlt }).click();

  await expect(page).toHaveURL(`/${locale}/search?q=${encodeURIComponent(query)}`);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(
    page.getByRole("heading", { level: 1, name: search.resultsHeading.replace("{query}", query) }),
  ).toBeVisible();
  await waitForSearchToSettle(page, search.loadingLabel);
  await expectRealHighlightedResults(page);

  // Facet sidebar copy is localized too, confirming this isn't the English
  // UI rendering Spanish content by accident.
  await expect(page.getByRole("heading", { level: 2, name: search.filterHeading })).toBeVisible();
};

/**
 * Reads every event pushed onto `window.dataLayer` so far in the real
 * browser — ticket 08's `sendSearchPerformedEvent`/`sendSearchResultClickedEvent`
 * push directly to it, so no GTM-container mock is needed to observe them
 * (unlike `quickServicesAnalytics.e2e.spec.ts`, which had no first-party
 * push code of its own to read back).
 */
interface DataLayerEvent {
  readonly event?: string;
  readonly query?: string;
  readonly resultCount?: number;
  readonly contentType?: string;
  readonly locale?: string;
}

const readDataLayerEvents = (page: Page): Promise<readonly DataLayerEvent[]> =>
  page.evaluate(() => (window.dataLayer ?? []) as DataLayerEvent[]);

/**
 * Verifies, for one locale, that clicking a real search result: (1)
 * navigates to the real destination page without a double-prefixed URL —
 * the exact regression risk `stripLocalePrefix()` guards against for every
 * non-default locale — and (2) fires both real analytics events with the
 * expected fields.
 */
const createResultClickAnalyticsTest = (locale: AppLocale) => {
  return async ({ page }: { page: Page }): Promise<void> => {
    const { search } = getApplicationMessages({ locale });
    const query = "funding";
    const learnPageLabel = search.typeLabels["Learn page"];

    await page.goto(`/${locale}/search?q=${query}`);
    await waitForSearchToSettle(page, search.loadingLabel);

    // Narrow to a known content type first, so the clicked result's type is
    // unambiguous rather than depending on Pagefind's relevance ranking.
    await page.locator("aside").getByText(learnPageLabel, { exact: true }).click();
    await waitForSearchToSettle(page, search.loadingLabel);

    const firstResultLink = page.locator(".usa-card__container h3 a").first();
    await expect(firstResultLink).toBeVisible();

    await firstResultLink.click();
    await page.waitForLoadState("domcontentloaded");

    // The core regression this guards against: `Link` (from `domain/i18n/
    // navigation.ts`) always re-prefixes whatever pathname it's given, and
    // Pagefind's `data.url` is already locale-prefixed — without stripping
    // that prefix first, every es-US result would land on a broken,
    // double-prefixed `/es-US/es-US/...` URL instead of the real page.
    const destinationUrl = new URL(page.url());
    expect(destinationUrl.pathname).not.toMatch(new RegExp(`^/${locale}/${locale}/`));
    // Confirms the click actually landed on a real page, not this app's 404.
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
      getApplicationMessages({ locale }).pageNotFound.title,
    );

    const events = await readDataLayerEvents(page);

    expect(events).toContainEqual(
      expect.objectContaining({ event: "search_performed", query, locale }),
    );
    expect(events).toContainEqual(
      expect.objectContaining({
        event: "search_result_clicked",
        query,
        contentType: "Learn page",
        locale,
      }),
    );
  };
};

/**
 * Verifies the Funding-program result's "view all funding programs" CTA
 * stays in the current locale. Unlike the result-title `Link` above, this
 * CTA doesn't need `stripLocalePrefix()` (its target, `/pages/funding`, is
 * this app's own unprefixed pathname, not one of Pagefind's already-
 * prefixed URLs) — but it still needs to go through the same locale-aware
 * `Link` component, not a plain `<a>`, to land on `/es-US/pages/funding`
 * rather than the English listing.
 */
const fundingCtaStaysInLocale = async ({ page }: { page: Page }): Promise<void> => {
  const locale: AppLocale = "es-US";
  const { search } = getApplicationMessages({ locale });
  const query = "funding";
  const fundingLabel = search.typeLabels["Funding program"];

  await page.goto(`/${locale}/search?q=${query}`);
  await waitForSearchToSettle(page, search.loadingLabel);

  await page.locator("aside").getByText(fundingLabel, { exact: true }).click();
  await waitForSearchToSettle(page, search.loadingLabel);

  const cta = page.getByRole("link", { name: search.fundingResultCtaLabel });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", `/${locale}/pages/funding`);
};

test.describe("search", () => {
  test.beforeEach(async ({ context }) => {
    // Suppress the preferred-language prompt modal so its overlay never
    // covers the header search form or search results this suite asserts on.
    await context.addCookies([
      { name: LANGUAGE_PROMPT_DISMISSED_COOKIE, value: "true", url: "http://127.0.0.1:3102" },
    ]);
  });

  test(
    "searching from the header lands on real results with a highlighted excerpt",
    searchFromHeaderLandsOnRealResults,
  );
  test("selecting a content-type facet narrows results to that type", facetNarrowsResultsToOneType);
  test("a nonsense query renders the zero-results state", nonsenseQueryRendersZeroResults);
  test(
    "es-US search returns real results with localized UI strings",
    spanishSearchReturnsLocalizedResults,
  );
  test(
    "clicking a result navigates to the real page and fires analytics events (en-US)",
    createResultClickAnalyticsTest("en-US"),
  );
  test(
    "clicking a result navigates to the real page and fires analytics events (es-US), without a double-prefixed URL",
    createResultClickAnalyticsTest("es-US"),
  );
  test("the Funding-program CTA stays in the current locale (es-US)", fundingCtaStaysInLocale);
});

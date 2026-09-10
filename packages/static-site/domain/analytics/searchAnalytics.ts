/**
 * Sends search-usage analytics events to Google Tag Manager.
 *
 * This module is the single place that calls `window.dataLayer.push()` for
 * the search feature (ticket 08), mirroring how `domain/search/searchFlag.ts`
 * funnels its one `process.env` read through a single helper. `static-site`
 * has no other custom-event infrastructure — `components/analytics/
 * GoogleTagManager.tsx` only bootstraps `dataLayer` and loads the container;
 * nothing else in this package has ever pushed a custom event before this.
 *
 * The `query` field on both events below is the visitor's literal, unredacted
 * search text — a deliberate product decision (not a derived/aggregate
 * signal) so the team can see what people actually search for and find
 * content gaps. This is backed by CISO approval; legal counsel's review of
 * the privacy policy's "anonymous/aggregated data" language was still in
 * progress at the time this shipped. There is no feature flag gating this —
 * Google Tag Manager itself is already always-on and ungated in this
 * package — so disabling it later requires a code change, not a flag flip.
 */

import type { AppLocale } from "@/domain/i18n/locales";

declare global {
  interface Window {
    /** Google Tag Manager's event queue, initialized by the GTM bootstrap snippet. */
    dataLayer?: unknown[];
  }
}

/**
 * Content types a search result can report when clicked.
 *
 * Excludes `"Funding program"` deliberately: Funding results render with no
 * link (map's standing decision, ticket 03/06), so a Funding result can never
 * be clicked and this event can never fire for one.
 */
export type SearchResultContentType = "Learn page" | "Update";

/**
 * Fires when a search actually executes and returns a result count —
 * whether from the initial query or a facet toggle re-running the search.
 */
export interface SearchPerformedEvent {
  readonly event: "search_performed";
  /** The visitor's literal, unredacted search text. */
  readonly query: string;
  /** Number of results the search returned. */
  readonly resultCount: number;
  /** Locale active when the search ran, recorded even when multilingual is disabled. */
  readonly locale: AppLocale;
}

/**
 * Fires when a visitor clicks a linkable search result.
 *
 * Carries the same `query` as the `search_performed` event that produced the
 * result, so downstream analysis can correlate a search with whether any
 * result from it was ever clicked (the map's "did we have the right
 * information" signal — a search with results but no correlated click is as
 * much a content gap as a zero-result search).
 */
export interface SearchResultClickedEvent {
  readonly event: "search_result_clicked";
  /** The search query that produced the clicked result. */
  readonly query: string;
  /** Content type of the clicked result. */
  readonly contentType: SearchResultContentType;
  /** Locale active when the result was clicked, recorded even when multilingual is disabled. */
  readonly locale: AppLocale;
}

type SearchAnalyticsEvent = SearchPerformedEvent | SearchResultClickedEvent;

/**
 * Pushes one search analytics event onto `window.dataLayer`.
 *
 * The GTM bootstrap snippet (`GoogleTagManager.tsx`) already initializes
 * `dataLayer` on every page with `strategy="afterInteractive"`, so by the
 * time a visitor can interact with search it is expected to exist — the
 * `?? []` fallback only guards the (untested-in-practice) case of this
 * running before that snippet has, rather than assuming it never could.
 *
 * @param event Event to push.
 */
const pushSearchEvent = (event: SearchAnalyticsEvent): void => {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
};

/**
 * Describes input for {@link sendSearchPerformedEvent}.
 */
export interface SendSearchPerformedEventParams {
  /** The visitor's literal, unredacted search text. */
  readonly query: string;
  /** Number of results the search returned. */
  readonly resultCount: number;
  /** Locale active when the search ran. */
  readonly locale: AppLocale;
}

/**
 * Sends the `search_performed` event.
 *
 * @param params Event input.
 * @param params.query The visitor's literal search text.
 * @param params.resultCount Number of results the search returned.
 * @param params.locale Locale active when the search ran.
 * @example
 * ```ts
 * sendSearchPerformedEvent({ query: "funding", resultCount: 12, locale: "en-US" });
 * ```
 */
export const sendSearchPerformedEvent = ({
  query,
  resultCount,
  locale,
}: SendSearchPerformedEventParams): void => {
  pushSearchEvent({ event: "search_performed", query, resultCount, locale });
};

/**
 * Describes input for {@link sendSearchResultClickedEvent}.
 */
export interface SendSearchResultClickedEventParams {
  /** The search query that produced the clicked result. */
  readonly query: string;
  /** Content type of the clicked result. */
  readonly contentType: SearchResultContentType;
  /** Locale active when the result was clicked. */
  readonly locale: AppLocale;
}

/**
 * Sends the `search_result_clicked` event.
 *
 * @param params Event input.
 * @param params.query The search query that produced the clicked result.
 * @param params.contentType Content type of the clicked result.
 * @param params.locale Locale active when the result was clicked.
 * @example
 * ```ts
 * sendSearchResultClickedEvent({ query: "funding", contentType: "Learn page", locale: "en-US" });
 * ```
 */
export const sendSearchResultClickedEvent = ({
  query,
  contentType,
  locale,
}: SendSearchResultClickedEventParams): void => {
  pushSearchEvent({ event: "search_result_clicked", query, contentType, locale });
};

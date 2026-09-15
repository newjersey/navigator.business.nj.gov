"use client";

/**
 * Owns the `/search` results page's client-side behavior: running the
 * pagefind search, the content-type facet filter, pagination, and every
 * loading/empty/error state. Pagefind's JS runs entirely in-browser, so this
 * must be a Client Component — the Server Component shell (`page.tsx`)
 * handles locale/flag gating and hands off the resolved `q` value here.
 */

import { useLocale } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import Pagination from "@/components/learn/Pagination";
import { renderResultCount } from "@/components/learn/renderResultCount";
import { usePaginatedScroll } from "@/components/learn/usePaginatedScroll";
import {
  type SearchResultContentType,
  sendSearchPerformedEvent,
  sendSearchResultClickedEvent,
} from "@/domain/analytics/searchAnalytics";
import type { SearchPageMessages } from "@/domain/content/messageTypes";
import { stripLocalePrefix } from "@/domain/i18n/localePath";
import { type AppLocale, resolveAppLocale } from "@/domain/i18n/locales";
import { Link } from "@/domain/i18n/navigation";
import {
  loadPagefindRuntime,
  type PagefindFilterValue,
  type PagefindResult,
  type PagefindResultData,
} from "@/domain/search/pagefindRuntime";

/** Results shown per page — matches the other paginated listings in this app. */
const ITEMS_PER_PAGE = 10;

/**
 * The `data-pagefind-filter` `type` values ticket 03 instrumented content
 * with. Fixed and known ahead of time, so this page doesn't need to call
 * `pagefind.filters()` to discover them.
 */
const CONTENT_TYPES = ["Learn page", "Update", "Funding program"] as const;

/**
 * One of the fixed content-type facet values.
 */
type ContentType = (typeof CONTENT_TYPES)[number];

/**
 * Funding-program results have no per-program URL (map's standing decision,
 * settled in ticket 03) — they render without a link, unlike every other
 * result type.
 */
const NON_LINKING_CONTENT_TYPE: ContentType = "Funding program";

/**
 * General funding listing a Funding-program result's CTA points to, since
 * there's no single-program destination to link to.
 */
const FUNDING_LISTING_PATHNAME = "/pages/funding";

/**
 * One result with its detail already loaded.
 */
interface LoadedResult {
  readonly id: string;
  readonly data: PagefindResultData;
}

/**
 * Describes props accepted by the search page content component.
 */
export interface SearchPageContentProps {
  /** The `q` value resolved from the URL by the Server Component shell. */
  readonly initialQuery: string;
  /** Localized search page content. */
  readonly messages: SearchPageMessages;
}

/**
 * Builds the `type` filter Pagefind's search API expects for the selected
 * facets. Multiple selected values need `{ any: [...] }` — Pagefind's
 * default filter semantics are AND, but a page only ever has one `type`
 * value, so ANDing types together would always return zero results.
 *
 * @param selectedTypes Facet values currently selected.
 * @returns A filter value, or `undefined` when no facet narrows the search.
 */
const buildTypeFilter = (
  selectedTypes: ReadonlySet<ContentType>,
): PagefindFilterValue | undefined => {
  const values = [...selectedTypes];

  if (values.length === 0) {
    return undefined;
  }

  if (values.length === 1) {
    return values[0];
  }

  return { any: values };
};

/**
 * Resolves a loaded result's content-type facet, if it matches one of the
 * fixed values this page knows about.
 *
 * @param data Loaded result detail.
 * @returns The matching content type, or `undefined`.
 */
const resultContentType = (data: PagefindResultData): ContentType | undefined => {
  const value = data.filters.type?.[0];

  return CONTENT_TYPES.find((type) => type === value);
};

/**
 * Narrows a result's content type to the subset that can ever be clicked.
 *
 * Funding-program results render with no link (see {@link NON_LINKING_CONTENT_TYPE}),
 * so `search_result_clicked` can never legitimately report that type — this
 * guard keeps that impossible case unrepresentable at the analytics call site
 * rather than relying on a separately-computed boolean to imply it.
 *
 * @param contentType Result content type to narrow.
 * @returns `true` when the content type is one `search_result_clicked` can report.
 */
const isLinkableContentType = (
  contentType: ContentType | undefined,
): contentType is SearchResultContentType => {
  return contentType === "Learn page" || contentType === "Update";
};

/**
 * Describes props accepted by one active-facet chip.
 */
interface FilterChipProps {
  readonly label: string;
  readonly removeLabel: string;
  readonly onRemove: () => void;
}

/**
 * Renders one removable active-filter chip, matching
 * `UpdatesPageContent.tsx`'s existing chip pattern.
 */
const FilterChip = ({ label, removeLabel, onRemove }: FilterChipProps) => (
  <span className="funding-filter-chip">
    {label}
    <button
      type="button"
      className="funding-filter-chip__remove"
      aria-label={removeLabel}
      onClick={onRemove}
    >
      <span aria-hidden="true">×</span>
    </button>
  </span>
);

/**
 * Describes props accepted by the active-facets chip bar.
 */
interface FilteringByBarProps {
  readonly messages: SearchPageMessages;
  readonly selectedTypes: ReadonlySet<ContentType>;
  readonly onRemoveType: (type: ContentType) => void;
}

/**
 * Renders the "Filtering by:" bar with one chip per active facet.
 */
const FilteringByBar = ({ messages, selectedTypes, onRemoveType }: FilteringByBarProps) => {
  if (selectedTypes.size === 0) {
    return null;
  }

  const removeLabel = (filterName: string): string =>
    messages.filterRemoveLabel.replace("{filter}", filterName);

  return (
    <section
      aria-label={messages.filteringByLabel}
      className="funding-filtering-by margin-y-2 padding-2 radius-md bg-primary-lightest border-1px border-primary"
    >
      <span className="margin-right-1">{messages.filteringByLabel}</span>
      {CONTENT_TYPES.filter((type) => selectedTypes.has(type)).map((type) => {
        const label = messages.typeLabels[type];

        return (
          <FilterChip
            key={type}
            label={label}
            removeLabel={removeLabel(label)}
            onRemove={() => onRemoveType(type)}
          />
        );
      })}
    </section>
  );
};

/**
 * Describes props accepted by the content-type facet sidebar.
 */
interface FacetSidebarProps {
  readonly messages: SearchPageMessages;
  readonly selectedTypes: ReadonlySet<ContentType>;
  readonly onToggleType: (type: ContentType) => void;
  readonly onReset: () => void;
}

/**
 * Renders the content-type facet checkboxes. Toggling applies immediately —
 * unlike the Updates/Funding listings' pending-vs-applied checkboxes, a
 * search results page has no separate on-page query box to batch changes
 * against, so instant feedback is the simpler, more expected behavior here.
 */
const FacetSidebar = ({ messages, selectedTypes, onToggleType, onReset }: FacetSidebarProps) => (
  <aside className="border-1px border-base-lighter padding-3 radius-lg funding-filter-col">
    <h2>{messages.filterHeading}</h2>
    <div className="funding-filter-options">
      {CONTENT_TYPES.map((type) => {
        const inputId = `search-type-${type.replace(/\s+/g, "-")}`;

        return (
          <div key={type} className="usa-checkbox">
            <input
              className="usa-checkbox__input"
              id={inputId}
              type="checkbox"
              checked={selectedTypes.has(type)}
              onChange={() => onToggleType(type)}
            />
            <label className="usa-checkbox__label" htmlFor={inputId}>
              {messages.typeLabels[type]}
            </label>
          </div>
        );
      })}
    </div>
    {selectedTypes.size > 0 && (
      <button
        type="button"
        className="usa-button usa-button--outline margin-top-2"
        onClick={onReset}
      >
        {messages.filterReset}
      </button>
    )}
  </aside>
);

/**
 * Describes props accepted by one result card.
 */
interface ResultCardProps {
  readonly result: LoadedResult;
  readonly messages: SearchPageMessages;
  /** The search query that produced this result, sent on click for analytics correlation. */
  readonly query: string;
  /** Locale active on the results page, sent on click for analytics. */
  readonly locale: AppLocale;
}

/**
 * Renders one search result. Funding-program results render without a link
 * (no per-program URL exists — map's standing decision) and get an
 * explanatory note plus a CTA to the general funding listing instead;
 * every other content type links normally to `data.url`.
 */
const ResultCard = ({ result, messages, query, locale }: ResultCardProps) => {
  const { data } = result;
  const contentType = resultContentType(data);
  const title = data.meta.title ?? data.url;
  const typeLabel = contentType ? messages.typeLabels[contentType] : undefined;
  const isNonLinking = contentType === NON_LINKING_CONTENT_TYPE;

  const handleResultClick = (): void => {
    if (!isLinkableContentType(contentType)) {
      return;
    }

    sendSearchResultClickedEvent({ query, contentType, locale });
  };

  return (
    <div className="usa-card__container margin-bottom-3">
      <div className="usa-card__header">
        <h3 className="usa-card__heading">
          {isNonLinking ? (
            title
          ) : (
            // `data.url` is a full, already locale-prefixed pathname computed
            // at crawl time (see `scripts/buildPagefindIndex.ts`), unlike
            // every other internal `href` in this app — this `Link` wrapper
            // always re-prefixes whatever pathname it's given, so the
            // existing prefix is stripped first to avoid a double-prefixed
            // `/es-US/es-US/...` link. Using this app's own `Link` (rather
            // than a plain `next/link`) also gives the click a soft,
            // client-side navigation, so the `search_result_clicked` push
            // below isn't racing a full-page unload.
            <Link href={stripLocalePrefix(data.url)} onClick={handleResultClick}>
              {title}
            </Link>
          )}
        </h3>
        {typeLabel && <span className="usa-tag margin-top-1">{typeLabel}</span>}
      </div>
      <div className="usa-card__body">
        {/*
          Pagefind pre-escapes HTML entities in `excerpt` before wrapping
          matches in its own <mark> tags, and this content originates from
          our own indexed pages (ticket 03), never visitor input — Pagefind's
          own docs call this safe to render as innerHTML, and no HTML-string
          parser is otherwise available in this codebase's dependencies.
        */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: pagefind-generated excerpt of our own content, entities pre-escaped by pagefind itself; see comment above. */}
        <p dangerouslySetInnerHTML={{ __html: data.excerpt }} />
        {isNonLinking && (
          <>
            <p className="text-italic margin-bottom-1">{messages.fundingResultNote}</p>
            <Link href={FUNDING_LISTING_PATHNAME} className="usa-button usa-button--outline">
              {messages.fundingResultCtaLabel}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Describes props accepted by the results section.
 */
interface ResultsSectionProps {
  readonly messages: SearchPageMessages;
  readonly resultsRef: React.RefObject<HTMLElement | null>;
  readonly pageLoadStatus: PageLoadStatus;
  readonly loadedResults: readonly LoadedResult[];
  readonly resultCount: React.ReactNode;
  readonly safePage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
  /** The search query that produced these results, threaded to each card for click analytics. */
  readonly query: string;
  /** Locale active on the results page, threaded to each card for click analytics. */
  readonly locale: AppLocale;
}

/**
 * Renders the result-count line, result cards for the current page, and
 * pagination.
 *
 * The outer `<section ref={resultsRef}>` stays mounted regardless of
 * `pageLoadStatus`, swapping only its inner content for a loading message —
 * `usePaginatedScroll`'s deferred scroll/focus call targets this same ref
 * after a page change, and page changes are exactly what puts this section
 * into its "loading" state (fetching the new page's result detail). If the
 * whole section unmounted during that window instead, the ref would go
 * null before the deferred call ran, silently dropping the scroll/focus
 * move this hook exists to provide.
 */
const ResultsSection = ({
  messages,
  resultsRef,
  pageLoadStatus,
  loadedResults,
  resultCount,
  safePage,
  totalPages,
  onPageChange,
  query,
  locale,
}: ResultsSectionProps) => (
  <section
    ref={resultsRef}
    tabIndex={-1}
    aria-label={messages.title}
    className="funding-results-col"
  >
    {pageLoadStatus === "loading" ? (
      <p role="status" aria-live="polite">
        {messages.loadingLabel}
      </p>
    ) : (
      <>
        <p className="margin-y-0" role="status" aria-live="polite">
          {resultCount}
        </p>
        <hr className="border-base-lighter border-top-1px margin-y-3" />
        {loadedResults.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            messages={messages}
            query={query}
            locale={locale}
          />
        ))}
        <Pagination
          messages={messages}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </>
    )}
  </section>
);

/**
 * Runs one pagefind search for the given query and type filter.
 */
interface RunSearchParams {
  readonly query: string;
  readonly selectedTypes: ReadonlySet<ContentType>;
}

const runSearch = async ({
  query,
  selectedTypes,
}: RunSearchParams): Promise<readonly PagefindResult[]> => {
  const pagefind = await loadPagefindRuntime();
  const typeFilter = buildTypeFilter(selectedTypes);
  const options = typeFilter ? { filters: { type: typeFilter } } : undefined;

  const response = await pagefind.search(query, options);

  return response.results;
};

/** Status of the top-level pagefind search request. */
type SearchStatus = "loading" | "ready" | "error";

/** Status of loading the current page's result detail. */
type PageLoadStatus = "loading" | "ready" | "error";

/**
 * Describes input for the search-running hook.
 */
interface UseSearchResultsParams {
  readonly query: string;
  readonly hasQuery: boolean;
  readonly selectedTypes: ReadonlySet<ContentType>;
  /** Locale active on the results page, sent with the `search_performed` event. */
  readonly locale: AppLocale;
}

/**
 * Describes output from the search-running hook.
 */
interface UseSearchResultsResult {
  readonly status: SearchStatus;
  readonly resultStubs: readonly PagefindResult[];
}

/**
 * Re-runs the pagefind search whenever the query or facet selection
 * changes. Tracks a request id so a stale response landing after a newer
 * facet toggle can't overwrite the latest results. Fires the
 * `search_performed` analytics event each time a search actually executes
 * and resolves — including a facet-triggered re-search, per the map's
 * decision to treat "search submitted" and "results rendered" as one event
 * rather than two, since they always happen together.
 *
 * @param params Search input.
 * @param params.query Trimmed search term.
 * @param params.hasQuery Whether `query` is non-empty.
 * @param params.selectedTypes Active content-type facets.
 * @param params.locale Locale active on the results page.
 * @returns The current search status and result stubs.
 * @example
 * ```ts
 * const { status, resultStubs } = useSearchResults({ query, hasQuery, selectedTypes, locale });
 * ```
 */
const useSearchResults = ({
  query,
  hasQuery,
  selectedTypes,
  locale,
}: UseSearchResultsParams): UseSearchResultsResult => {
  const [status, setStatus] = useState<SearchStatus>(hasQuery ? "loading" : "ready");
  const [resultStubs, setResultStubs] = useState<readonly PagefindResult[]>([]);
  const requestId = useRef(0);

  useEffect(() => {
    if (!hasQuery) {
      return;
    }

    requestId.current += 1;
    const thisRequestId = requestId.current;
    setStatus("loading");

    runSearch({ query, selectedTypes })
      .then((results) => {
        if (requestId.current === thisRequestId) {
          setResultStubs(results);
          setStatus("ready");
          sendSearchPerformedEvent({ query, resultCount: results.length, locale });
        }
      })
      .catch(() => {
        if (requestId.current === thisRequestId) {
          setStatus("error");
        }
      });
  }, [query, selectedTypes, hasQuery, locale]);

  return { status, resultStubs };
};

/**
 * Describes input for the page-detail-loading hook.
 */
interface UsePageResultsDataParams {
  readonly pageStubs: readonly PagefindResult[];
}

/**
 * Describes output from the page-detail-loading hook.
 */
interface UsePageResultsDataResult {
  readonly status: PageLoadStatus;
  readonly loadedResults: readonly LoadedResult[];
}

/**
 * Loads full detail only for the current page's result stubs, per
 * Pagefind's own bandwidth guidance (`data()` fetches per-result content) —
 * never for the whole result set at once.
 *
 * @param params Loading input.
 * @param params.pageStubs The current page's result stubs.
 * @returns The current page-load status and loaded results.
 * @example
 * ```ts
 * const { status, loadedResults } = usePageResultsData({ pageStubs });
 * ```
 */
const usePageResultsData = ({ pageStubs }: UsePageResultsDataParams): UsePageResultsDataResult => {
  const [status, setStatus] = useState<PageLoadStatus>("ready");
  const [loadedResults, setLoadedResults] = useState<readonly LoadedResult[]>([]);
  const requestId = useRef(0);

  useEffect(() => {
    if (pageStubs.length === 0) {
      setLoadedResults([]);
      setStatus("ready");
      return;
    }

    requestId.current += 1;
    const thisRequestId = requestId.current;
    setStatus("loading");

    Promise.all(pageStubs.map((stub) => stub.data().then((data) => ({ id: stub.id, data }))))
      .then((results) => {
        if (requestId.current === thisRequestId) {
          setLoadedResults(results);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (requestId.current === thisRequestId) {
          setStatus("error");
        }
      });
  }, [pageStubs]);

  return { status, loadedResults };
};

/**
 * Describes props accepted by the results body.
 */
interface SearchResultsBodyProps {
  readonly messages: SearchPageMessages;
  readonly hasQuery: boolean;
  readonly query: string;
  readonly searchStatus: SearchStatus;
  readonly resultStubs: readonly PagefindResult[];
  readonly selectedTypes: ReadonlySet<ContentType>;
  readonly onToggleType: (type: ContentType) => void;
  readonly onRemoveType: (type: ContentType) => void;
  readonly onResetTypes: () => void;
  readonly pageLoadStatus: PageLoadStatus;
  readonly loadedResults: readonly LoadedResult[];
  readonly resultCount: React.ReactNode;
  readonly resultsRef: React.RefObject<HTMLElement | null>;
  readonly safePage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
  /** Locale active on the results page, threaded to each card for click analytics. */
  readonly locale: AppLocale;
}

/**
 * Renders every search-page state: no-query prompt, loading, error,
 * zero-result, and the populated results view with facets and pagination.
 */
const SearchResultsBody = ({
  messages,
  hasQuery,
  query,
  searchStatus,
  resultStubs,
  selectedTypes,
  onToggleType,
  onRemoveType,
  onResetTypes,
  pageLoadStatus,
  loadedResults,
  resultCount,
  resultsRef,
  safePage,
  totalPages,
  onPageChange,
  locale,
}: SearchResultsBodyProps) => (
  <div className="grid-container usa-section">
    <noscript>{messages.noScriptMessage}</noscript>

    <h1>{hasQuery ? messages.resultsHeading.replace("{query}", query) : messages.title}</h1>

    {!hasQuery && <p className="usa-intro">{messages.noQueryBody}</p>}

    {hasQuery && searchStatus === "loading" && (
      <p role="status" aria-live="polite">
        {messages.loadingLabel}
      </p>
    )}

    {hasQuery && searchStatus === "error" && (
      <p role="alert" className="usa-alert usa-alert--error usa-alert--slim padding-2">
        {messages.errorMessage}
      </p>
    )}

    {hasQuery && searchStatus === "ready" && resultStubs.length === 0 && (
      <div>
        <h2>{messages.zeroResultsTitle}</h2>
        <p>{messages.zeroResultsBody}</p>
      </div>
    )}

    {hasQuery && searchStatus === "ready" && resultStubs.length > 0 && (
      <div className="funding-layout layout-wide">
        <div className="funding-header-col">
          <FilteringByBar
            messages={messages}
            selectedTypes={selectedTypes}
            onRemoveType={onRemoveType}
          />
        </div>

        <FacetSidebar
          messages={messages}
          selectedTypes={selectedTypes}
          onToggleType={onToggleType}
          onReset={onResetTypes}
        />

        <ResultsSection
          messages={messages}
          resultsRef={resultsRef}
          pageLoadStatus={pageLoadStatus}
          loadedResults={loadedResults}
          resultCount={resultCount}
          safePage={safePage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          query={query}
          locale={locale}
        />
      </div>
    )}
  </div>
);

export const SearchPageContent = ({ initialQuery, messages }: SearchPageContentProps) => {
  const query = useMemo(() => initialQuery.trim(), [initialQuery]);
  const hasQuery = query !== "";
  const locale = resolveAppLocale({ locale: useLocale() });

  const [selectedTypes, setSelectedTypes] = useState<ReadonlySet<ContentType>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const { resultsRef, handlePageChange } = usePaginatedScroll(setCurrentPage);

  const { status: searchStatus, resultStubs } = useSearchResults({
    query,
    hasQuery,
    selectedTypes,
    locale,
  });

  // Resets pagination to page 1 whenever the result set itself changes (a
  // new query or a facet toggle). Adjusted directly during render, per
  // React's own guidance for resetting state when a value changes, rather
  // than an Effect whose body wouldn't otherwise read `resultStubs`.
  const [resultStubsAtLastPageReset, setResultStubsAtLastPageReset] = useState(resultStubs);
  if (resultStubs !== resultStubsAtLastPageReset) {
    setResultStubsAtLastPageReset(resultStubs);
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(resultStubs.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageStubs = useMemo(
    () => resultStubs.slice(pageStartIndex, pageStartIndex + ITEMS_PER_PAGE),
    [resultStubs, pageStartIndex],
  );

  const { status: pageLoadStatus, loadedResults } = usePageResultsData({ pageStubs });

  const toggleType = (type: ContentType): void => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const removeType = (type: ContentType): void => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      next.delete(type);
      return next;
    });
  };

  const resultCount = renderResultCount({
    start: pageStartIndex + 1,
    end: pageStartIndex + pageStubs.length,
    shownCount: pageStubs.length,
    filteredCount: resultStubs.length,
    totalCount: resultStubs.length,
    messages,
  });

  return (
    <SearchResultsBody
      messages={messages}
      hasQuery={hasQuery}
      query={query}
      searchStatus={searchStatus}
      resultStubs={resultStubs}
      selectedTypes={selectedTypes}
      onToggleType={toggleType}
      onRemoveType={removeType}
      onResetTypes={() => setSelectedTypes(new Set())}
      pageLoadStatus={pageLoadStatus}
      loadedResults={loadedResults}
      resultCount={resultCount}
      resultsRef={resultsRef}
      safePage={safePage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      locale={locale}
    />
  );
};

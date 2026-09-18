/**
 * Types and a loader for Pagefind's browser search runtime.
 *
 * The runtime (`/pagefind/pagefind.js`) is generated output, not an npm
 * dependency — `scripts/buildPagefindIndex.ts`'s `postbuild` step writes it
 * to `public/pagefind/` (see ticket 04's research doc). Pagefind ships no
 * `.d.ts` for this browser API (only for the unrelated Node indexing
 * service), so these types are hand-written from Pagefind's own docs
 * (https://pagefind.app/docs/api/, https://pagefind.app/docs/js-api-filtering/).
 */

/**
 * One result's lazily-loaded detail, fetched via its `data()` method.
 *
 * `excerpt` is pre-escaped HTML (Pagefind encodes entities before adding its
 * own `<mark>` tags), safe to render as `innerHTML`.
 */
export interface PagefindResultData {
  /** Absolute pathname of the matched page. */
  readonly url: string;
  /** HTML excerpt with matches wrapped in `<mark>`, entities pre-escaped. */
  readonly excerpt: string;
  /** Metadata captured from the page (e.g. `title`). */
  readonly meta: Readonly<Record<string, string>>;
  /** `data-pagefind-filter` values captured for the page, keyed by filter name. */
  readonly filters: Readonly<Record<string, readonly string[]>>;
}

/**
 * One search result stub. Call `data()` to lazily fetch `PagefindResultData`
 * — Pagefind's own guidance is to only call this for the current page's
 * slice of results, to limit bandwidth.
 */
export interface PagefindResult {
  /** Unique, language-prefixed result id. */
  readonly id: string;
  /** Fetches this result's full data. */
  readonly data: () => Promise<PagefindResultData>;
}

/**
 * Compound filter expression, per
 * https://pagefind.app/docs/js-api-filtering/#using-compound-filters.
 *
 * Filtering defaults to AND semantics across multiple values for the same
 * key, so a single-valued content-type facet like this app's `type` filter
 * needs `{ any: [...] }` to OR multiple selected values together.
 */
export type PagefindFilterValue = string | readonly string[] | { readonly any: readonly string[] };

/**
 * Options accepted by `search()`.
 */
export interface PagefindSearchOptions {
  /** Filters to apply alongside the search term, keyed by filter name. */
  readonly filters?: Readonly<Record<string, PagefindFilterValue>>;
}

/**
 * Response returned by `search()`.
 */
export interface PagefindSearchResponse {
  /** Matching result stubs, in relevance order. */
  readonly results: readonly PagefindResult[];
}

/**
 * The subset of Pagefind's browser API this app uses.
 */
export interface PagefindRuntime {
  /** Runs a search, optionally scoped by filters. */
  readonly search: (
    query: string | null,
    options?: PagefindSearchOptions,
  ) => Promise<PagefindSearchResponse>;
}

/**
 * Runtime-relative path Pagefind's `postbuild` step writes its bundle to.
 */
const PAGEFIND_RUNTIME_PATH = "/pagefind/pagefind.js";

/**
 * Loads Pagefind's browser runtime.
 *
 * This must stay a runtime, string-literal dynamic import, never a static
 * top-level `import` — the file does not exist in the source tree, only in
 * `public/pagefind/` after the build's `postbuild` step has run, so the
 * bundler must never try to statically resolve it (see ticket 01's research
 * doc, "Client-side loading").
 *
 * @returns The loaded Pagefind runtime.
 * @example
 * ```ts
 * const pagefind = await loadPagefindRuntime();
 * const results = await pagefind.search("business");
 * ```
 */
export const loadPagefindRuntime = (): Promise<PagefindRuntime> => {
  return import(/* webpackIgnore: true */ PAGEFIND_RUNTIME_PATH) as Promise<PagefindRuntime>;
};

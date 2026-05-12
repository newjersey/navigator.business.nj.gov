import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  type PagefindModule,
  type PagefindModuleLoader,
  type PagefindSearchResponse,
  SearchResults,
} from "./SearchResults";

/**
 * Localized search content used by component tests.
 */
const SEARCH_CONTENT = {
  pageTitle: "Search",
  pageDescription: "Search Business.NJ.gov pages and resources.",
  inputLabel: "Search Business.NJ.gov",
  submitLabel: "Search",
  emptyStateTitle: "Search Business.NJ.gov",
  emptyStateDescription: "Enter a term to find pages and resources.",
  loadingLabel: "Searching",
  noResultsTitle: "No results found",
  noResultsDescription: "Try different terms or check spelling.",
  errorTitle: "Search is unavailable",
  errorDescription: "Refresh the page or try again later.",
  resultSingularLabel: "result",
  resultPluralLabel: "results",
  resultQueryConnector: "for",
};

/**
 * Creates a fake Pagefind response with one loaded result.
 */
const createOneResultResponse = (): PagefindSearchResponse => {
  return {
    unfilteredResultCount: 1,
    results: [
      {
        id: "business-names",
        score: 1,
        words: [1],
        data: async () => {
          return {
            url: "/en-US/business-names",
            excerpt: "Choose an available <mark>business</mark> name.",
            plain_excerpt: "Choose an available business name.",
            meta: {
              title: "Business Names",
            },
            sub_results: [
              {
                url: "/en-US/business-names#business-names-section-2",
                title: "Search Available Business Names",
                excerpt: "Search for an available <mark>business</mark> name.",
                plain_excerpt: "Search for an available business name.",
              },
            ],
          };
        },
      },
    ],
  };
};

/**
 * Creates a fake Pagefind module loader for component tests.
 */
const createPagefindModuleLoader = (response: PagefindSearchResponse): PagefindModuleLoader => {
  return async (): Promise<PagefindModule> => {
    return {
      search: async () => {
        return response;
      },
    };
  };
};

/**
 * Verifies the empty query state renders before search.
 */
const shouldRenderEmptySearchState = () => {
  render(
    <SearchResults
      content={SEARCH_CONTENT}
      initialQuery=""
      pagefindModuleLoader={createPagefindModuleLoader({
        results: [],
        unfilteredResultCount: 0,
      })}
    />,
  );

  expect(screen.getByRole("heading", { name: SEARCH_CONTENT.emptyStateTitle })).toBeTruthy();
  expect(screen.getByRole("searchbox", { name: SEARCH_CONTENT.inputLabel })).toBeTruthy();
};

/**
 * Verifies initial URL queries load and render Pagefind results.
 */
const shouldRenderLoadedSearchResults = async () => {
  render(
    <SearchResults
      content={SEARCH_CONTENT}
      initialQuery="business"
      pagefindModuleLoader={createPagefindModuleLoader(createOneResultResponse())}
    />,
  );

  expect(await screen.findByRole("link", { name: "Business Names" })).toBeTruthy();
  expect(screen.getByText('1 result for "business"')).toBeTruthy();
  expect(screen.getByRole("link", { name: "Search Available Business Names" })).toBeTruthy();
};

/**
 * Verifies no-result queries render the no-result state.
 */
const shouldRenderNoResultsState = async () => {
  render(
    <SearchResults
      content={SEARCH_CONTENT}
      initialQuery="missing"
      pagefindModuleLoader={createPagefindModuleLoader({
        results: [],
        unfilteredResultCount: 0,
      })}
    />,
  );

  expect(await screen.findByRole("heading", { name: SEARCH_CONTENT.noResultsTitle })).toBeTruthy();
};

describe("Search results component", () => {
  it("renders the empty search state", shouldRenderEmptySearchState);
  it("renders loaded Pagefind results", shouldRenderLoadedSearchResults);
  it("renders the no-results state", shouldRenderNoResultsState);
});

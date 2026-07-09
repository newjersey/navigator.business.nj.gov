"use client";

import { useMemo, useState } from "react";
import type { LicensingGuidePageMessages } from "@/domain/content/messageTypes";
import type { License, PageItem } from "@/domain/content/types";
import LicenseCard from "./LicenseCard";
import Pagination from "./Pagination";
import { renderResultCount } from "./renderResultCount";
import { usePaginatedScroll } from "./usePaginatedScroll";

const ITEMS_PER_PAGE = 10;

interface FilterChipProps {
  readonly label: string;
  readonly removeLabel: string;
  readonly onRemove: () => void;
}

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

interface Props {
  readonly messages: LicensingGuidePageMessages;
  readonly page: PageItem;
  readonly licenses: readonly License[];
}

const searchableText = (license: License): string =>
  `${license.name} ${license.summaryDescriptionMd ?? ""}`.toLowerCase();

const LicensingGuidePageContent = ({ messages, page, licenses }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const { resultsRef, handlePageChange } = usePaginatedScroll(setCurrentPage);

  const entries = useMemo(
    () => licenses.map((license) => ({ license, text: searchableText(license) })),
    [licenses],
  );
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      entries
        .filter(({ text }) => normalizedQuery === "" || text.includes(normalizedQuery))
        .map(({ license }) => license),
    [entries, normalizedQuery],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageSlice = filtered.slice(pageStartIndex, safePage * ITEMS_PER_PAGE);

  const resultCount = renderResultCount({
    start: pageStartIndex + 1,
    end: pageStartIndex + pageSlice.length,
    shownCount: pageSlice.length,
    filteredCount: filtered.length,
    totalCount: licenses.length,
    messages,
  });
  const showResultsLabel = messages.filterShowResults.replace("{count}", String(filtered.length));

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
    setCurrentPage(1);
  };

  const clearSearch = (): void => {
    setQuery("");
    setCurrentPage(1);
  };

  const searchChipLabel = messages.filterSearchChip.replace("{query}", query);

  return (
    <div className="funding-layout layout-wide">
      <div className="funding-header-col">
        <h1>{messages.title}</h1>
        {page["sub-heading-text"] && <p className="usa-intro">{page["sub-heading-text"]}</p>}

        <div className="padding-3 margin-bottom-3 radius-lg border-2px border-base-lighter">
          <h2 className="margin-top-0">{messages.ctaHeading}</h2>
          <p>{messages.ctaBody}</p>
          <a href="https://account.business.nj.gov/" className="usa-button">
            {messages.ctaButton}
          </a>
        </div>
      </div>

      <aside className="border-1px border-base-lighter padding-3 radius-lg funding-filter-col">
        <h2>{messages.filterHeading}</h2>
        <div className="margin-y-3" style={{ display: "flow-root" }}>
          <label className="usa-label text-bold margin-bottom-1" htmlFor="license-search">
            {messages.filterSearch}
          </label>
          <input
            id="license-search"
            className="usa-input"
            type="search"
            value={query}
            onChange={handleSearchChange}
          />
        </div>
        <hr className="border-base-lighter border-top-1px margin-y-2" />
        <div className="display-flex flex-justify">
          <button
            type="button"
            className="usa-button width-full"
            onClick={() => handlePageChange(1)}
          >
            {showResultsLabel}
          </button>
          <button
            type="button"
            className="usa-button usa-button--outline margin-right-0"
            onClick={clearSearch}
          >
            {messages.filterReset}
          </button>
        </div>
      </aside>

      <section
        ref={resultsRef}
        tabIndex={-1}
        aria-label={messages.title}
        className="funding-results-col"
      >
        {query.trim() !== "" && (
          <section
            aria-label={messages.filteringByLabel}
            className="funding-filtering-by margin-bottom-2 padding-2 radius-md bg-primary-lightest border-1px border-primary"
          >
            <span className="margin-right-1">{messages.filteringByLabel}</span>
            <FilterChip
              label={searchChipLabel}
              removeLabel={messages.filterRemoveLabel.replace("{filter}", searchChipLabel)}
              onRemove={clearSearch}
            />
          </section>
        )}

        <p className="margin-bottom-2">{resultCount}</p>
        {pageSlice.map((license) => (
          <LicenseCard
            key={license.webflowId ?? license.urlSlug}
            license={license}
            messages={messages}
            query={query}
          />
        ))}
        <Pagination
          messages={messages}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
};

export default LicensingGuidePageContent;

"use client";

import { Fragment, type ReactNode, useMemo, useState } from "react";
import type { LicensingGuidePageMessages } from "@/domain/content/messageTypes";
import type { License, PageItem } from "@/domain/content/types";
import LicenseCard from "./LicenseCard";

const ITEMS_PER_PAGE = 10;

interface ResultCountParams {
  readonly template: string;
  readonly filtered: number;
  readonly total: number;
}

/**
 * Renders the result-count template, substituting `{total}` as text and the
 * `<bold>…</bold>`-wrapped `{filtered}` count as a `<strong>` element. Keeping
 * the whole sentence in one message (rather than splitting it in the component)
 * lets translators control word order around the bolded count.
 */
const renderResultCount = ({ template, filtered, total }: ResultCountParams): ReactNode => {
  const withTotal = template.replace("{total}", String(total));
  return withTotal.split(/(<bold>.*?<\/bold>)/).map((part, index) => {
    const boldMatch = part.match(/^<bold>(.*?)<\/bold>$/);
    if (boldMatch === null) {
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and stable per render
      return <Fragment key={index}>{part}</Fragment>;
    }
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and stable per render
      <strong key={index}>{boldMatch[1].replace("{filtered}", String(filtered))}</strong>
    );
  });
};

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
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const safePage = Math.min(currentPage, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const resultCount = renderResultCount({
    template: messages.resultCount,
    filtered: filtered.length,
    total: licenses.length,
  });
  const showResultsLabel = messages.filterShowResults.replace("{count}", String(filtered.length));

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
    setCurrentPage(1);
  };

  const removeQuery = (): void => {
    setQuery("");
    setCurrentPage(1);
  };

  const resetAll = (): void => {
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
          <button type="button" className="usa-button width-full" onClick={() => setCurrentPage(1)}>
            {showResultsLabel}
          </button>
          <button
            type="button"
            className="usa-button usa-button--outline margin-right-0"
            onClick={resetAll}
          >
            {messages.filterReset}
          </button>
        </div>
      </aside>

      <div className="funding-results-col">
        {query.trim() !== "" && (
          <section
            aria-label={messages.filteringByLabel}
            className="funding-filtering-by margin-bottom-2 padding-2 radius-md bg-primary-lightest border-1px border-primary"
          >
            <span className="margin-right-1">{messages.filteringByLabel}</span>
            <FilterChip
              label={searchChipLabel}
              removeLabel={messages.filterRemoveLabel.replace("{filter}", searchChipLabel)}
              onRemove={removeQuery}
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
        {totalPages > 1 && (
          <nav aria-label={messages.paginationLabel} className="usa-pagination">
            <ul className="usa-pagination__list">
              <li className="usa-pagination__item usa-pagination__arrow">
                <button
                  type="button"
                  className="usa-pagination__link usa-pagination__previous-page"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={safePage === 1}
                  aria-label={messages.paginationPrevious}
                >
                  <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
                    <use href="/assets/njwds/dist/img/sprite.svg#navigate_before" />
                  </svg>
                  <span className="usa-pagination__link-text">{messages.paginationPrevious}</span>
                </button>
              </li>
              {pageNumbers.map((pageNumber) => (
                <li
                  key={`page-${pageNumber}`}
                  className="usa-pagination__item usa-pagination__page-no"
                >
                  <button
                    type="button"
                    className={`usa-pagination__button${safePage === pageNumber ? " usa-current" : ""}`}
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-label={messages.paginationPageLabel.replace("{page}", String(pageNumber))}
                    aria-current={safePage === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}
              <li className="usa-pagination__item usa-pagination__arrow">
                <button
                  type="button"
                  className="usa-pagination__link usa-pagination__next-page"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={safePage === totalPages}
                  aria-label={messages.paginationNext}
                >
                  <span className="usa-pagination__link-text">{messages.paginationNext}</span>
                  <svg className="usa-icon" aria-hidden="true" focusable="false" role="img">
                    <use href="/assets/njwds/dist/img/sprite.svg#navigate_next" />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default LicensingGuidePageContent;

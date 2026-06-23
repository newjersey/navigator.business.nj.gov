"use client";

import { useState } from "react";
import type { FundingPageMessages } from "@/domain/content/messageTypes";
import type { Funding, PageItem, Sector } from "@/domain/content/types";
import FundingCard from "./FundingCard";

const ITEMS_PER_PAGE = 10;

const FUNDING_TYPES = [
  "Grant",
  "Loan",
  "Tax Credit",
  "Tax Exemption",
  "Technical Assistance",
  "Hiring & Employee Training Support",
];

interface Props {
  readonly messages: FundingPageMessages;
  readonly page: PageItem;
  readonly fundings: readonly Funding[];
  readonly sectors: readonly Sector[];
}

const FundingPageContent = ({ messages, page, fundings, sectors }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(fundings.length / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const pageSlice = fundings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const resultCount = messages.resultCount.replace("{count}", String(fundings.length));
  const showResultsLabel = messages.filterShowResults.replace("{count}", String(fundings.length));

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
          <label className="usa-label text-bold margin-bottom-1" htmlFor="funding-search">
            {messages.filterSearch}
          </label>
          <input id="funding-search" className="usa-input" type="search" readOnly />
        </div>

        <hr className="border-base-lighter border-top-1px margin-y-2" />

        <fieldset className="usa-fieldset margin-bottom-2">
          <legend className="usa-legend text-bold display-flex flex-justify flex-align-center width-full margin-bottom-1">
            {messages.filterIndustry}
            <button type="button" className="usa-button usa-button--unstyled font-sans-xs">
              {messages.filterClear}
            </button>
          </legend>
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            <div className="usa-checkbox">
              <input
                className="usa-checkbox__input"
                id="industry-all"
                type="checkbox"
                defaultChecked
                readOnly
              />
              <label className="usa-checkbox__label" htmlFor="industry-all">
                All Industries
              </label>
            </div>
            {sectors.map((sector) => (
              <div key={sector.id} className="usa-checkbox">
                <input
                  className="usa-checkbox__input"
                  id={`industry-${sector.id}`}
                  type="checkbox"
                  readOnly
                />
                <label className="usa-checkbox__label" htmlFor={`industry-${sector.id}`}>
                  {sector.name}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <hr className="border-base-lighter border-top-1px margin-y-2" />

        <fieldset className="usa-fieldset margin-bottom-3">
          <legend className="usa-legend text-bold display-flex flex-justify flex-align-center width-full margin-bottom-1">
            {messages.filterFundingType}
            <button type="button" className="usa-button usa-button--unstyled font-sans-xs">
              {messages.filterClear}
            </button>
          </legend>
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {FUNDING_TYPES.map((type) => (
              <div key={type} className="usa-checkbox">
                <input
                  className="usa-checkbox__input"
                  id={`type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                  type="checkbox"
                  readOnly
                />
                <label
                  className="usa-checkbox__label"
                  htmlFor={`type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <hr className="border-base-lighter border-top-1px margin-y-2" />

        <div className="display-flex flex-justify">
          <button type="button" className="usa-button width-full">
            {showResultsLabel}
          </button>
          <button type="button" className="usa-button usa-button--outline margin-right-0">
            {messages.filterReset}
          </button>
        </div>
      </aside>

      <div className="funding-results-col">
        <p className="margin-bottom-2">{resultCount}</p>

        {pageSlice.map((funding) => (
          <FundingCard key={funding.id} funding={funding} />
        ))}

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="usa-pagination">
            <ul className="usa-pagination__list">
              <li className="usa-pagination__item usa-pagination__arrow">
                <button
                  type="button"
                  className="usa-pagination__link usa-pagination__previous-page"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
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
                    className={`usa-pagination__button${
                      currentPage === pageNumber ? " usa-current" : ""
                    }`}
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={currentPage === pageNumber ? "page" : undefined}
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
                  disabled={currentPage === totalPages}
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

export default FundingPageContent;

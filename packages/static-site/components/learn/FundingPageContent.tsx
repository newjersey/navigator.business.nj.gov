"use client";

import { Fragment, type ReactNode, useMemo, useState } from "react";
import type { FundingPageMessages } from "@/domain/content/messageTypes";
import type { Funding, FundingType, PageItem, Sector } from "@/domain/content/types";
import FundingCard from "./FundingCard";
import { parseFundingContent } from "./parseFundingContent";

const ITEMS_PER_PAGE = 10;

const fundingTypes = (messages: FundingPageMessages): readonly FundingType[] =>
  Object.keys(messages.fundingTypeLabels) as FundingType[];

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

interface Props {
  readonly messages: FundingPageMessages;
  readonly page: PageItem;
  readonly fundings: readonly Funding[];
  readonly sectors: readonly Sector[];
}

interface AppliedFilters {
  readonly industries: ReadonlySet<string>;
  readonly fundingTypes: ReadonlySet<FundingType>;
}

const matchesFilters = (funding: Funding, filters: AppliedFilters): boolean => {
  const typeMatch =
    filters.fundingTypes.size === 0 || filters.fundingTypes.has(funding.fundingType);
  const industryMatch =
    filters.industries.size === 0 || funding.sector.some((id) => filters.industries.has(id));
  return typeMatch && industryMatch;
};

const fundingSearchableText = (funding: Funding): string => {
  const { eligibility, benefits } = parseFundingContent(funding.contentMd ?? "");
  return `${funding.name} ${eligibility} ${benefits}`.toLowerCase();
};

const matchesQuery = (searchableText: string, normalizedQuery: string): boolean =>
  normalizedQuery === "" || searchableText.includes(normalizedQuery);

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

interface FilteringByBarProps {
  readonly messages: FundingPageMessages;
  readonly sectors: readonly Sector[];
  readonly applied: AppliedFilters;
  readonly query: string;
  readonly onRemoveIndustry: (id: string) => void;
  readonly onRemoveFundingType: (id: FundingType) => void;
  readonly onRemoveQuery: () => void;
}

const FilteringByBar = ({
  messages,
  sectors,
  applied,
  query,
  onRemoveIndustry,
  onRemoveFundingType,
  onRemoveQuery,
}: FilteringByBarProps) => {
  if (applied.industries.size === 0 && applied.fundingTypes.size === 0 && query.trim() === "") {
    return null;
  }

  const industryLabel = (id: string): string => sectors.find((s) => s.id === id)?.name ?? id;

  const removeLabel = (filterName: string): string =>
    messages.filterRemoveLabel.replace("{filter}", filterName);

  return (
    <section
      aria-label={messages.filteringByLabel}
      className="funding-filtering-by margin-bottom-2 padding-2 radius-md bg-primary-lightest border-1px border-primary"
    >
      <span className="margin-right-1">{messages.filteringByLabel}</span>
      {query.trim() !== "" && (
        <FilterChip
          key="search"
          label={messages.filterSearchChip.replace("{query}", query)}
          removeLabel={removeLabel(messages.filterSearchChip.replace("{query}", query))}
          onRemove={onRemoveQuery}
        />
      )}
      {sectors
        .map((s) => s.id)
        .filter((id) => applied.industries.has(id))
        .map((id) => {
          const label = industryLabel(id);
          return (
            <FilterChip
              key={`industry-${id}`}
              label={label}
              removeLabel={removeLabel(label)}
              onRemove={() => onRemoveIndustry(id)}
            />
          );
        })}
      {fundingTypes(messages)
        .filter((id) => applied.fundingTypes.has(id))
        .map((id) => {
          const label = messages.fundingTypeLabels[id];
          return (
            <FilterChip
              key={`type-${id}`}
              label={label}
              removeLabel={removeLabel(label)}
              onRemove={() => onRemoveFundingType(id)}
            />
          );
        })}
    </section>
  );
};

const FundingPageContent = ({ messages, page, fundings, sectors }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingIndustries, setPendingIndustries] = useState<ReadonlySet<string>>(new Set());
  const [pendingFundingTypes, setPendingFundingTypes] = useState<ReadonlySet<FundingType>>(
    new Set(),
  );
  const [applied, setApplied] = useState<AppliedFilters>({
    industries: new Set(),
    fundingTypes: new Set(),
  });
  const [query, setQuery] = useState("");

  const searchableEntries = useMemo(
    () => fundings.map((funding) => ({ funding, searchableText: fundingSearchableText(funding) })),
    [fundings],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredFundings = useMemo(
    () =>
      searchableEntries
        .filter(
          ({ funding, searchableText }) =>
            matchesFilters(funding, applied) && matchesQuery(searchableText, normalizedQuery),
        )
        .map(({ funding }) => funding),
    [searchableEntries, applied, normalizedQuery],
  );

  const pendingFiltered = useMemo(
    () =>
      searchableEntries.filter(
        ({ funding, searchableText }) =>
          matchesFilters(funding, {
            industries: pendingIndustries,
            fundingTypes: pendingFundingTypes,
          }) && matchesQuery(searchableText, normalizedQuery),
      ),
    [searchableEntries, pendingIndustries, pendingFundingTypes, normalizedQuery],
  );

  const totalPages = Math.max(1, Math.ceil(filteredFundings.length / ITEMS_PER_PAGE));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const safePage = Math.min(currentPage, totalPages);
  const pageSlice = filteredFundings.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const resultCount = renderResultCount({
    template: messages.resultCount,
    filtered: filteredFundings.length,
    total: fundings.length,
  });
  const showResultsLabel = messages.filterShowResults.replace(
    "{count}",
    String(pendingFiltered.length),
  );

  const toggleIndustry = (id: string): void => {
    setPendingIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleFundingType = (id: FundingType): void => {
    setPendingFundingTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const applyPending = (): void => {
    setApplied({
      industries: new Set(pendingIndustries),
      fundingTypes: new Set(pendingFundingTypes),
    });
    setCurrentPage(1);
  };

  const removeIndustry = (id: string): void => {
    setApplied((prev) => {
      const next = new Set(prev.industries);
      next.delete(id);
      return { ...prev, industries: next };
    });
    setPendingIndustries((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setCurrentPage(1);
  };

  const removeFundingType = (id: FundingType): void => {
    setApplied((prev) => {
      const next = new Set(prev.fundingTypes);
      next.delete(id);
      return { ...prev, fundingTypes: next };
    });
    setPendingFundingTypes((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
    setCurrentPage(1);
  };

  const removeQuery = (): void => {
    setQuery("");
    setCurrentPage(1);
  };

  const clearPendingIndustries = (): void => {
    setPendingIndustries(new Set());
  };

  const clearPendingFundingTypes = (): void => {
    setPendingFundingTypes(new Set());
  };

  const resetAll = (): void => {
    setPendingIndustries(new Set());
    setPendingFundingTypes(new Set());
    setApplied({ industries: new Set(), fundingTypes: new Set() });
    setCurrentPage(1);
  };

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
          <input
            id="funding-search"
            className="usa-input"
            type="search"
            value={query}
            onChange={handleSearchChange}
          />
        </div>

        <hr className="border-base-lighter border-top-1px margin-y-2" />
        <fieldset className="usa-fieldset margin-bottom-2">
          <legend className="usa-legend text-bold display-flex flex-justify flex-align-center width-full margin-bottom-1">
            {messages.filterIndustry}
            <button
              type="button"
              className="usa-button usa-button--unstyled font-sans-xs"
              onClick={clearPendingIndustries}
            >
              {messages.filterClear}
            </button>
          </legend>
          <div className="funding-filter-options">
            {sectors.map((sector) => (
              <div key={sector.id} className="usa-checkbox">
                <input
                  className="usa-checkbox__input"
                  id={`industry-${sector.id}`}
                  type="checkbox"
                  checked={pendingIndustries.has(sector.id)}
                  onChange={() => toggleIndustry(sector.id)}
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
            <button
              type="button"
              className="usa-button usa-button--unstyled font-sans-xs"
              onClick={clearPendingFundingTypes}
            >
              {messages.filterClear}
            </button>
          </legend>
          <div className="funding-filter-options">
            {fundingTypes(messages).map((type) => {
              const inputId = `type-${type.replace(/\s+/g, "-")}`;
              return (
                <div key={type} className="usa-checkbox">
                  <input
                    className="usa-checkbox__input"
                    id={inputId}
                    type="checkbox"
                    checked={pendingFundingTypes.has(type)}
                    onChange={() => toggleFundingType(type)}
                  />
                  <label className="usa-checkbox__label" htmlFor={inputId}>
                    {messages.fundingTypeLabels[type]}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>

        <hr className="border-base-lighter border-top-1px margin-y-2" />

        <div className="display-flex flex-justify">
          <button type="button" className="usa-button width-full" onClick={applyPending}>
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
        <FilteringByBar
          messages={messages}
          sectors={sectors}
          applied={applied}
          query={query}
          onRemoveIndustry={removeIndustry}
          onRemoveFundingType={removeFundingType}
          onRemoveQuery={removeQuery}
        />

        <p className="margin-bottom-2">{resultCount}</p>

        {pageSlice.map((funding) => (
          <FundingCard key={funding.id} funding={funding} messages={messages} query={query} />
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
                    className={`usa-pagination__button${
                      safePage === pageNumber ? " usa-current" : ""
                    }`}
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

export default FundingPageContent;

"use client";

import { type ReactNode, useMemo, useState } from "react";
import type { FundingPageMessages } from "@/domain/content/messageTypes";
import type { Funding, FundingType, PageItem, Sector } from "@/domain/content/types";
import FundingCard from "./FundingCard";
import Pagination from "./Pagination";
import { parseFundingContent } from "./parseFundingContent";
import { renderResultCount } from "./renderResultCount";
import { usePaginatedScroll } from "./usePaginatedScroll";

const ITEMS_PER_PAGE = 10;

const fundingTypes = (messages: FundingPageMessages): readonly FundingType[] =>
  Object.keys(messages.fundingTypeLabels) as FundingType[];

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

const withToggled = <T,>(set: ReadonlySet<T>, id: T): ReadonlySet<T> => {
  const next = new Set(set);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
};

const withRemoved = <T,>(set: ReadonlySet<T>, id: T): ReadonlySet<T> => {
  const next = new Set(set);
  next.delete(id);
  return next;
};

const matchesFilters = (funding: Funding, filters: AppliedFilters): boolean => {
  const typeMatch =
    filters.fundingTypes.size === 0 || filters.fundingTypes.has(funding.fundingType);
  const industryMatch =
    filters.industries.size === 0 ||
    funding.sector.some((id: string) => filters.industries.has(id));
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

interface FundingFilterState {
  readonly query: string;
  readonly pendingIndustries: ReadonlySet<string>;
  readonly pendingFundingTypes: ReadonlySet<FundingType>;
  readonly applied: AppliedFilters;
  readonly pageSlice: readonly Funding[];
  readonly safePage: number;
  readonly totalPages: number;
  readonly resultsRef: React.RefObject<HTMLElement | null>;
  readonly resultCount: ReactNode;
  readonly showResultsLabel: string;
  readonly handlePageChange: (page: number) => void;
  readonly handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly toggleIndustry: (id: string) => void;
  readonly toggleFundingType: (id: FundingType) => void;
  readonly applyPending: () => void;
  readonly resetAll: () => void;
  readonly clearPendingIndustries: () => void;
  readonly clearPendingFundingTypes: () => void;
  readonly removeIndustry: (id: string) => void;
  readonly removeFundingType: (id: FundingType) => void;
  readonly removeQuery: () => void;
}

const useFundingSearchableEntries = (fundings: readonly Funding[]) =>
  useMemo(
    () => fundings.map((funding) => ({ funding, searchableText: fundingSearchableText(funding) })),
    [fundings],
  );

interface SearchableEntry {
  readonly funding: Funding;
  readonly searchableText: string;
}

interface FundingResultsData {
  readonly totalPages: number;
  readonly safePage: number;
  readonly pageSlice: readonly Funding[];
  readonly resultCount: ReactNode;
  readonly showResultsLabel: string;
}

interface UseFundingResultsDataParams {
  readonly messages: FundingPageMessages;
  readonly searchableEntries: readonly SearchableEntry[];
  readonly totalFundingCount: number;
  readonly applied: AppliedFilters;
  readonly pendingIndustries: ReadonlySet<string>;
  readonly pendingFundingTypes: ReadonlySet<FundingType>;
  readonly normalizedQuery: string;
  readonly currentPage: number;
}

const useFundingResultsData = ({
  messages,
  searchableEntries,
  totalFundingCount,
  applied,
  pendingIndustries,
  pendingFundingTypes,
  normalizedQuery,
  currentPage,
}: UseFundingResultsDataParams): FundingResultsData => {
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

  const pendingFilteredCount = useMemo(
    () =>
      searchableEntries.filter(
        ({ funding, searchableText }) =>
          matchesFilters(funding, {
            industries: pendingIndustries,
            fundingTypes: pendingFundingTypes,
          }) && matchesQuery(searchableText, normalizedQuery),
      ).length,
    [searchableEntries, pendingIndustries, pendingFundingTypes, normalizedQuery],
  );

  const totalPages = Math.max(1, Math.ceil(filteredFundings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageSlice = filteredFundings.slice(pageStartIndex, safePage * ITEMS_PER_PAGE);

  const resultCount = renderResultCount({
    start: pageStartIndex + 1,
    end: pageStartIndex + pageSlice.length,
    shownCount: pageSlice.length,
    filteredCount: filteredFundings.length,
    totalCount: totalFundingCount,
    messages,
  });
  const showResultsLabel = messages.filterShowResults.replace(
    "{count}",
    String(pendingFilteredCount),
  );

  return { totalPages, safePage, pageSlice, resultCount, showResultsLabel };
};

interface FundingFilterActions {
  readonly toggleIndustry: (id: string) => void;
  readonly toggleFundingType: (id: FundingType) => void;
  readonly applyPending: () => void;
  readonly resetAll: () => void;
  readonly clearPendingIndustries: () => void;
  readonly clearPendingFundingTypes: () => void;
  readonly removeIndustry: (id: string) => void;
  readonly removeFundingType: (id: FundingType) => void;
  readonly handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly removeQuery: () => void;
}

interface UseFundingFilterActionsParams {
  readonly pendingIndustries: ReadonlySet<string>;
  readonly pendingFundingTypes: ReadonlySet<FundingType>;
  readonly setPendingIndustries: (
    update: (prev: ReadonlySet<string>) => ReadonlySet<string>,
  ) => void;
  readonly setPendingFundingTypes: (
    update: (prev: ReadonlySet<FundingType>) => ReadonlySet<FundingType>,
  ) => void;
  readonly setApplied: (update: (prev: AppliedFilters) => AppliedFilters) => void;
  readonly setQuery: (query: string) => void;
  readonly setCurrentPage: (page: number) => void;
}

const useFundingFilterActions = ({
  pendingIndustries,
  pendingFundingTypes,
  setPendingIndustries,
  setPendingFundingTypes,
  setApplied,
  setQuery,
  setCurrentPage,
}: UseFundingFilterActionsParams): FundingFilterActions => {
  const toggleIndustry = (id: string): void =>
    setPendingIndustries((prev) => withToggled(prev, id));
  const toggleFundingType = (id: FundingType): void =>
    setPendingFundingTypes((prev) => withToggled(prev, id));

  const applyPending = (): void => {
    setApplied(() => ({
      industries: new Set(pendingIndustries),
      fundingTypes: new Set(pendingFundingTypes),
    }));
    setCurrentPage(1);
  };

  const removeIndustry = (id: string): void => {
    setApplied((prev) => ({ ...prev, industries: withRemoved(prev.industries, id) }));
    setPendingIndustries((prev) => withRemoved(prev, id));
    setCurrentPage(1);
  };

  const removeFundingType = (id: FundingType): void => {
    setApplied((prev) => ({ ...prev, fundingTypes: withRemoved(prev.fundingTypes, id) }));
    setPendingFundingTypes((prev) => withRemoved(prev, id));
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

  const clearPendingIndustries = (): void => setPendingIndustries(() => new Set());
  const clearPendingFundingTypes = (): void => setPendingFundingTypes(() => new Set());

  const resetAll = (): void => {
    setPendingIndustries(() => new Set());
    setPendingFundingTypes(() => new Set());
    setApplied(() => ({ industries: new Set(), fundingTypes: new Set() }));
    setQuery("");
    setCurrentPage(1);
  };

  return {
    toggleIndustry,
    toggleFundingType,
    applyPending,
    resetAll,
    clearPendingIndustries,
    clearPendingFundingTypes,
    removeIndustry,
    removeFundingType,
    handleSearchChange,
    removeQuery,
  };
};

const useFundingFilterState = (
  messages: FundingPageMessages,
  fundings: readonly Funding[],
): FundingFilterState => {
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
  const { resultsRef, handlePageChange } = usePaginatedScroll(setCurrentPage);

  const searchableEntries = useFundingSearchableEntries(fundings);
  const normalizedQuery = query.trim().toLowerCase();

  const resultsData = useFundingResultsData({
    messages,
    searchableEntries,
    totalFundingCount: fundings.length,
    applied,
    pendingIndustries,
    pendingFundingTypes,
    normalizedQuery,
    currentPage,
  });

  const actions = useFundingFilterActions({
    pendingIndustries,
    pendingFundingTypes,
    setPendingIndustries,
    setPendingFundingTypes,
    setApplied,
    setQuery,
    setCurrentPage,
  });

  return {
    query,
    pendingIndustries,
    pendingFundingTypes,
    applied,
    resultsRef,
    handlePageChange,
    ...resultsData,
    ...actions,
  };
};

interface FundingHeaderProps {
  readonly messages: FundingPageMessages;
  readonly page: PageItem;
}

const FundingHeader = ({ messages, page }: FundingHeaderProps) => (
  <div className="funding-header-col">
    <h1>{messages.title}</h1>
    {page["sub-heading-text"] && <p className="usa-intro">{page["sub-heading-text"]}</p>}

    <div className="padding-3 margin-bottom-3 radius-lg border-2px border-base-lighter">
      <h2 className="margin-top-0">{messages.ctaHeading}</h2>
      <p>{messages.ctaBody}</p>
      <a href="https://account.business.nj.gov/onboarding" className="usa-button">
        {messages.ctaButton}
      </a>
    </div>
  </div>
);

interface FundingFilterSidebarProps {
  readonly messages: FundingPageMessages;
  readonly sectors: readonly Sector[];
  readonly filterState: FundingFilterState;
}

const FundingFilterSidebar = ({ messages, sectors, filterState }: FundingFilterSidebarProps) => (
  <aside className="border-1px border-base-lighter padding-3 radius-lg funding-filter-col">
    <h2>{messages.filterHeading}</h2>

    <div className="margin-y-3 funding-search-field">
      <label className="usa-label text-bold margin-bottom-1" htmlFor="funding-search">
        {messages.filterSearch}
      </label>
      <input
        id="funding-search"
        className="usa-input"
        type="search"
        value={filterState.query}
        onChange={filterState.handleSearchChange}
      />
    </div>

    <hr className="border-base-lighter border-top-1px margin-y-2" />
    <fieldset className="usa-fieldset margin-bottom-2">
      <legend className="usa-legend text-bold display-flex flex-justify flex-align-center width-full margin-bottom-1">
        {messages.filterIndustry}
        <button
          type="button"
          className="usa-button usa-button--unstyled font-sans-xs"
          onClick={filterState.clearPendingIndustries}
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
              checked={filterState.pendingIndustries.has(sector.id)}
              onChange={() => filterState.toggleIndustry(sector.id)}
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
          onClick={filterState.clearPendingFundingTypes}
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
                checked={filterState.pendingFundingTypes.has(type)}
                onChange={() => filterState.toggleFundingType(type)}
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
      <button type="button" className="usa-button width-full" onClick={filterState.applyPending}>
        {filterState.showResultsLabel}
      </button>
      <button
        type="button"
        className="usa-button usa-button--outline margin-right-0"
        onClick={filterState.resetAll}
      >
        {messages.filterReset}
      </button>
    </div>
  </aside>
);

interface FundingResultsSectionProps {
  readonly messages: FundingPageMessages;
  readonly sectors: readonly Sector[];
  readonly filterState: FundingFilterState;
}

const FundingResultsSection = ({ messages, sectors, filterState }: FundingResultsSectionProps) => (
  <section
    ref={filterState.resultsRef}
    tabIndex={-1}
    aria-label={messages.title}
    className="funding-results-col"
  >
    <FilteringByBar
      messages={messages}
      sectors={sectors}
      applied={filterState.applied}
      query={filterState.query}
      onRemoveIndustry={filterState.removeIndustry}
      onRemoveFundingType={filterState.removeFundingType}
      onRemoveQuery={filterState.removeQuery}
    />

    <p className="margin-bottom-2" role="status" aria-live="polite">
      {filterState.resultCount}
    </p>

    {filterState.pageSlice.map((funding) => (
      <FundingCard
        key={funding.id}
        funding={funding}
        messages={messages}
        query={filterState.query}
      />
    ))}

    <Pagination
      messages={messages}
      currentPage={filterState.safePage}
      totalPages={filterState.totalPages}
      onPageChange={filterState.handlePageChange}
    />
  </section>
);

const FundingPageContent = ({ messages, page, fundings, sectors }: Props) => {
  const filterState = useFundingFilterState(messages, fundings);

  return (
    <div className="funding-layout layout-wide">
      <FundingHeader messages={messages} page={page} />
      <FundingFilterSidebar messages={messages} sectors={sectors} filterState={filterState} />
      <FundingResultsSection messages={messages} sectors={sectors} filterState={filterState} />
    </div>
  );
};

export default FundingPageContent;

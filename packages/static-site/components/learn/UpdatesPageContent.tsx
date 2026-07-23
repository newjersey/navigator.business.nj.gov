"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { UpdatesPageMessages } from "@/domain/content/messageTypes";
import type { RecentItem } from "@/domain/content/types";
import Pagination from "./Pagination";
import { renderResultCount } from "./renderResultCount";
import UpdatesCard from "./UpdatesCard";
import { usePaginatedScroll } from "./usePaginatedScroll";

const ITEMS_PER_PAGE = 10;

type SortOrder = "recent" | "az" | "za";

interface Props {
  readonly messages: UpdatesPageMessages;
  readonly recents: readonly RecentItem[];
}

const categories = (messages: UpdatesPageMessages): readonly string[] =>
  Object.keys(messages.categoryLabels);

const matchesCategories = (recent: RecentItem, applied: ReadonlySet<string>): boolean =>
  applied.size === 0 || (recent.topics !== undefined && applied.has(recent.topics));

const searchableText = (recent: RecentItem): string =>
  `${recent.name} ${recent.body} ${recent.topics ?? ""} ${recent.agency ?? ""}`.toLowerCase();

const matchesQuery = (text: string, normalizedQuery: string): boolean =>
  normalizedQuery === "" || text.includes(normalizedQuery);

const sortRecents = (recents: readonly RecentItem[], order: SortOrder): RecentItem[] => {
  const sorted = [...recents];
  if (order === "az") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (order === "za") {
    return sorted.sort((a, b) => b.name.localeCompare(a.name));
  }
  return sorted.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
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

interface FilteringByBarProps {
  readonly messages: UpdatesPageMessages;
  readonly appliedCategories: ReadonlySet<string>;
  readonly query: string;
  readonly onRemoveCategory: (category: string) => void;
  readonly onRemoveQuery: () => void;
}

const FilteringByBar = ({
  messages,
  appliedCategories,
  query,
  onRemoveCategory,
  onRemoveQuery,
}: FilteringByBarProps) => {
  if (appliedCategories.size === 0 && query.trim() === "") {
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
      {query.trim() !== "" && (
        <FilterChip
          key="search"
          label={messages.filterSearchChip.replace("{query}", query)}
          removeLabel={removeLabel(messages.filterSearchChip.replace("{query}", query))}
          onRemove={onRemoveQuery}
        />
      )}
      {categories(messages)
        .filter((category) => appliedCategories.has(category))
        .map((category) => {
          const label = messages.categoryLabels[category];
          return (
            <FilterChip
              key={`category-${category}`}
              label={label}
              removeLabel={removeLabel(label)}
              onRemove={() => onRemoveCategory(category)}
            />
          );
        })}
    </section>
  );
};

interface RecentsFilter {
  readonly query: string;
  readonly sortOrder: SortOrder;
  readonly pendingCategories: ReadonlySet<string>;
  readonly appliedCategories: ReadonlySet<string>;
  readonly filteredRecents: readonly RecentItem[];
  readonly pendingCount: number;
  readonly toggleCategory: (category: string) => void;
  readonly applyPending: () => void;
  readonly removeCategory: (category: string) => void;
  readonly handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly removeQuery: () => void;
  readonly clearPendingCategories: () => void;
  readonly resetAll: () => void;
  readonly handleSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface CategoryFilterState {
  readonly pendingCategories: ReadonlySet<string>;
  readonly appliedCategories: ReadonlySet<string>;
  readonly toggleCategory: (category: string) => void;
  readonly applyPending: () => void;
  readonly removeCategory: (category: string) => void;
  readonly clearPendingCategories: () => void;
  readonly resetCategories: () => void;
}

/**
 * Owns the pending-vs-applied category distinction: toggling a checkbox only
 * updates the pending set, and categories take effect on the result list once
 * "Show Results" (`applyPending`) is clicked. `onApply` lets the caller reset
 * pagination whenever the applied set changes.
 */
const useCategoryFilter = (onApply: () => void): CategoryFilterState => {
  const [pendingCategories, setPendingCategories] = useState<ReadonlySet<string>>(new Set());
  const [appliedCategories, setAppliedCategories] = useState<ReadonlySet<string>>(new Set());

  const toggleCategory = (category: string): void => {
    setPendingCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const applyPending = (): void => {
    setAppliedCategories(new Set(pendingCategories));
    onApply();
  };

  const removeCategory = (category: string): void => {
    setAppliedCategories((prev) => {
      const next = new Set(prev);
      next.delete(category);
      return next;
    });
    setPendingCategories((prev) => {
      const next = new Set(prev);
      next.delete(category);
      return next;
    });
    onApply();
  };

  const clearPendingCategories = (): void => {
    setPendingCategories(new Set());
  };

  const resetCategories = (): void => {
    setPendingCategories(new Set());
    setAppliedCategories(new Set());
  };

  return {
    pendingCategories,
    appliedCategories,
    toggleCategory,
    applyPending,
    removeCategory,
    clearPendingCategories,
    resetCategories,
  };
};

/**
 * Owns the search/category/sort filter state for the updates list.
 * `onFilterChange` lets the caller reset pagination whenever a filter that
 * changes the result set is applied.
 */
const useRecentsFilter = (
  recents: readonly RecentItem[],
  onFilterChange: () => void,
): RecentsFilter => {
  const categoryFilter = useCategoryFilter(onFilterChange);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");

  const searchableEntries = useMemo(
    () => recents.map((recent) => ({ recent, text: searchableText(recent) })),
    [recents],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredRecents = useMemo(
    () =>
      sortRecents(
        searchableEntries
          .filter(
            ({ recent, text }) =>
              matchesCategories(recent, categoryFilter.appliedCategories) &&
              matchesQuery(text, normalizedQuery),
          )
          .map(({ recent }) => recent),
        sortOrder,
      ),
    [searchableEntries, categoryFilter.appliedCategories, normalizedQuery, sortOrder],
  );

  const pendingCount = useMemo(
    () =>
      searchableEntries.filter(
        ({ recent, text }) =>
          matchesCategories(recent, categoryFilter.pendingCategories) &&
          matchesQuery(text, normalizedQuery),
      ).length,
    [searchableEntries, categoryFilter.pendingCategories, normalizedQuery],
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
    onFilterChange();
  };

  const removeQuery = (): void => {
    setQuery("");
    onFilterChange();
  };

  const resetAll = (): void => {
    categoryFilter.resetCategories();
    setQuery("");
    onFilterChange();
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortOrder(event.target.value as SortOrder);
    onFilterChange();
  };

  return {
    query,
    sortOrder,
    pendingCategories: categoryFilter.pendingCategories,
    appliedCategories: categoryFilter.appliedCategories,
    filteredRecents,
    pendingCount,
    toggleCategory: categoryFilter.toggleCategory,
    applyPending: categoryFilter.applyPending,
    removeCategory: categoryFilter.removeCategory,
    handleSearchChange,
    removeQuery,
    clearPendingCategories: categoryFilter.clearPendingCategories,
    resetAll,
    handleSortChange,
  };
};

interface FilterSidebarProps {
  readonly messages: UpdatesPageMessages;
  readonly query: string;
  readonly pendingCategories: ReadonlySet<string>;
  readonly showResultsLabel: string;
  readonly onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onToggleCategory: (category: string) => void;
  readonly onClearPendingCategories: () => void;
  readonly onApplyPending: () => void;
  readonly onReset: () => void;
}

const FilterSidebar = ({
  messages,
  query,
  pendingCategories,
  showResultsLabel,
  onSearchChange,
  onToggleCategory,
  onClearPendingCategories,
  onApplyPending,
  onReset,
}: FilterSidebarProps) => (
  <aside className="border-1px border-base-lighter padding-3 radius-lg funding-filter-col">
    <h2>{messages.filterHeading}</h2>

    <div className="margin-y-3 funding-search-field">
      <label className="usa-label text-bold margin-bottom-1" htmlFor="updates-search">
        {messages.filterSearch}
      </label>
      <input
        id="updates-search"
        className="usa-input"
        type="search"
        value={query}
        onChange={onSearchChange}
      />
    </div>

    <hr className="border-base-lighter border-top-1px margin-y-2" />
    <fieldset className="usa-fieldset margin-bottom-2">
      <legend className="usa-legend text-bold display-flex flex-justify flex-align-center width-full margin-bottom-1">
        {messages.filterCategory}
        <button
          type="button"
          className="usa-button usa-button--unstyled font-sans-xs"
          onClick={onClearPendingCategories}
        >
          {messages.filterClear}
        </button>
      </legend>
      <div className="funding-filter-options">
        {categories(messages).map((category) => {
          const inputId = `category-${category.replace(/\s+/g, "-")}`;
          return (
            <div key={category} className="usa-checkbox">
              <input
                className="usa-checkbox__input"
                id={inputId}
                type="checkbox"
                checked={pendingCategories.has(category)}
                onChange={() => onToggleCategory(category)}
              />
              <label className="usa-checkbox__label" htmlFor={inputId}>
                {messages.categoryLabels[category]}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>

    <hr className="border-base-lighter border-top-1px margin-y-2" />

    <div className="display-flex flex-justify">
      <button type="button" className="usa-button width-full" onClick={onApplyPending}>
        {showResultsLabel}
      </button>
      <button
        type="button"
        className="usa-button usa-button--outline margin-right-0"
        onClick={onReset}
      >
        {messages.filterReset}
      </button>
    </div>
  </aside>
);

interface ResultsSectionProps {
  readonly messages: UpdatesPageMessages;
  readonly resultsRef: React.RefObject<HTMLElement | null>;
  readonly appliedCategories: ReadonlySet<string>;
  readonly query: string;
  readonly onRemoveCategory: (category: string) => void;
  readonly onRemoveQuery: () => void;
  readonly resultCount: ReactNode;
  readonly sortOrder: SortOrder;
  readonly onSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  readonly pageSlice: readonly RecentItem[];
  readonly safePage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
}

const ResultsSection = ({
  messages,
  resultsRef,
  appliedCategories,
  query,
  onRemoveCategory,
  onRemoveQuery,
  resultCount,
  sortOrder,
  onSortChange,
  pageSlice,
  safePage,
  totalPages,
  onPageChange,
}: ResultsSectionProps) => (
  <section
    ref={resultsRef}
    tabIndex={-1}
    aria-label={messages.title}
    className="funding-results-col"
  >
    <FilteringByBar
      messages={messages}
      appliedCategories={appliedCategories}
      query={query}
      onRemoveCategory={onRemoveCategory}
      onRemoveQuery={onRemoveQuery}
    />

    <div className="display-flex flex-justify flex-align-center margin-y-3">
      <p role="status" aria-live="polite" className="margin-y-0">
        {resultCount}
      </p>
      <div className="display-flex flex-align-center margin-y-0">
        <label
          className="usa-label text-bold text-no-wrap margin-right-1 margin-y-0"
          htmlFor="updates-sort"
        >
          {messages.sortLabel}
        </label>
        <select
          id="updates-sort"
          className="usa-select margin-y-0"
          value={sortOrder}
          onChange={onSortChange}
        >
          <option value="recent">{messages.sortMostRecent}</option>
          <option value="az">{messages.sortAZ}</option>
          <option value="za">{messages.sortZA}</option>
        </select>
      </div>
    </div>

    <hr className="border-base-lighter border-top-1px margin-y-3" />

    {pageSlice.map((recent) => (
      <UpdatesCard key={recent.slug} recent={recent} messages={messages} query={query} />
    ))}

    <Pagination
      messages={messages}
      currentPage={safePage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  </section>
);

const UpdatesPageContent = ({ messages, recents }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { resultsRef, handlePageChange } = usePaginatedScroll(setCurrentPage);
  const resetToFirstPage = (): void => setCurrentPage(1);
  const filter = useRecentsFilter(recents, resetToFirstPage);

  const totalPages = Math.max(1, Math.ceil(filter.filteredRecents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageSlice = filter.filteredRecents.slice(pageStartIndex, safePage * ITEMS_PER_PAGE);

  const resultCount = renderResultCount({
    start: pageStartIndex + 1,
    end: pageStartIndex + pageSlice.length,
    shownCount: pageSlice.length,
    filteredCount: filter.filteredRecents.length,
    totalCount: recents.length,
    messages,
  });
  const showResultsLabel = messages.filterShowResults.replace(
    "{count}",
    String(filter.pendingCount),
  );

  return (
    <div className="funding-layout layout-wide">
      <div className="funding-header-col">
        <h1>{messages.title}</h1>
        <p className="usa-intro">{messages.intro}</p>
      </div>

      <FilterSidebar
        messages={messages}
        query={filter.query}
        pendingCategories={filter.pendingCategories}
        showResultsLabel={showResultsLabel}
        onSearchChange={filter.handleSearchChange}
        onToggleCategory={filter.toggleCategory}
        onClearPendingCategories={filter.clearPendingCategories}
        onApplyPending={filter.applyPending}
        onReset={filter.resetAll}
      />

      <ResultsSection
        messages={messages}
        resultsRef={resultsRef}
        appliedCategories={filter.appliedCategories}
        query={filter.query}
        onRemoveCategory={filter.removeCategory}
        onRemoveQuery={filter.removeQuery}
        resultCount={resultCount}
        sortOrder={filter.sortOrder}
        onSortChange={filter.handleSortChange}
        pageSlice={pageSlice}
        safePage={safePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UpdatesPageContent;

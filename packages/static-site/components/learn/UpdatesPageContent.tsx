"use client";

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

const UpdatesPageContent = ({ messages, recents }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingCategories, setPendingCategories] = useState<ReadonlySet<string>>(new Set());
  const [appliedCategories, setAppliedCategories] = useState<ReadonlySet<string>>(new Set());
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const { resultsRef, handlePageChange } = usePaginatedScroll(setCurrentPage);

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
              matchesCategories(recent, appliedCategories) && matchesQuery(text, normalizedQuery),
          )
          .map(({ recent }) => recent),
        sortOrder,
      ),
    [searchableEntries, appliedCategories, normalizedQuery, sortOrder],
  );

  const pendingFiltered = useMemo(
    () =>
      searchableEntries.filter(
        ({ recent, text }) =>
          matchesCategories(recent, pendingCategories) && matchesQuery(text, normalizedQuery),
      ),
    [searchableEntries, pendingCategories, normalizedQuery],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageSlice = filteredRecents.slice(pageStartIndex, safePage * ITEMS_PER_PAGE);

  const resultCount = renderResultCount({
    start: pageStartIndex + 1,
    end: pageStartIndex + pageSlice.length,
    shownCount: pageSlice.length,
    filteredCount: filteredRecents.length,
    totalCount: recents.length,
    messages,
  });
  const showResultsLabel = messages.filterShowResults.replace(
    "{count}",
    String(pendingFiltered.length),
  );

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
    setCurrentPage(1);
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

  const clearPendingCategories = (): void => {
    setPendingCategories(new Set());
  };

  const resetAll = (): void => {
    setPendingCategories(new Set());
    setAppliedCategories(new Set());
    setQuery("");
    setCurrentPage(1);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortOrder(event.target.value as SortOrder);
    setCurrentPage(1);
  };

  return (
    <div className="funding-layout layout-wide">
      <div className="funding-header-col">
        <h1>{messages.title}</h1>
        <p className="usa-intro">{messages.intro}</p>
      </div>

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
            onChange={handleSearchChange}
          />
        </div>

        <hr className="border-base-lighter border-top-1px margin-y-2" />
        <fieldset className="usa-fieldset margin-bottom-2">
          <legend className="usa-legend text-bold display-flex flex-justify flex-align-center width-full margin-bottom-1">
            {messages.filterCategory}
            <button
              type="button"
              className="usa-button usa-button--unstyled font-sans-xs"
              onClick={clearPendingCategories}
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
                    onChange={() => toggleCategory(category)}
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
          onRemoveCategory={removeCategory}
          onRemoveQuery={removeQuery}
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
              onChange={handleSortChange}
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
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
};

export default UpdatesPageContent;

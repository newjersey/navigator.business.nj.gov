import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { UpdatesPageMessages } from "@/domain/content/messageTypes";
import type { RecentItem } from "@/domain/content/types";
import UpdatesPageContent from "./UpdatesPageContent";

const messages: UpdatesPageMessages = {
  title: "All Updates",
  intro: "Learn about new rules, resources, and upcoming changes.",
  filterHeading: "Filter All Updates",
  filterSearch: "Search",
  filterCategory: "Category",
  categoryLabels: {
    "Grants and Resources": "Grants and Resources",
    "Rules and Regulations": "Rules and Regulations",
  },
  filterClear: "Clear",
  filterShowResults: "Show {count} Results",
  filterReset: "Reset",
  sortLabel: "Sort by:",
  sortMostRecent: "Most Recent",
  sortAZ: "A-Z",
  sortZA: "Z-A",
  resultCountShowing: "Showing <bold>{start}–{end}</bold> of {total} Updates",
  resultCountFiltered:
    "Showing <bold>{start}–{end}</bold> of {filtered} Updates (of {total} total)",
  resultCountFilteredEmpty: "0 matching Updates (of {total} total)",
  filteringByLabel: "Filtering by:",
  filterSearchChip: 'Search: "{query}"',
  filterRemoveLabel: "Remove {filter} filter",
  paginationPrevious: "Previous",
  paginationNext: "Next",
  paginationLabel: "Pagination",
  paginationPageLabel: "Page {page}",
  cardUpdatedLabel: "Last Updated",
  cardReadMore: "Read more",
  detailCtaFallback: "Learn More",
};

const makeRecent = (name: string, overrides: Partial<RecentItem> = {}): RecentItem =>
  ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    date: "2022-01-01",
    topics: "Grants and Resources",
    status: "Published",
    body: `Body for ${name}.`,
    ...overrides,
  }) as RecentItem;

const makeRecents = (count: number): RecentItem[] =>
  Array.from({ length: count }, (_, i) => makeRecent(`Update ${String(i + 1).padStart(2, "0")}`));

const renderPage = (recents: RecentItem[]) =>
  render(<UpdatesPageContent messages={messages} recents={recents} />);

const testStaticContentAndPagination = () => {
  it("renders the page title", () => {
    renderPage([]);
    expect(screen.getByRole("heading", { level: 1, name: "All Updates" })).toBeInTheDocument();
  });

  it("renders the intro text", () => {
    renderPage([]);
    expect(
      screen.getByText("Learn about new rules, resources, and upcoming changes."),
    ).toBeInTheDocument();
  });

  it("renders result count with total updates", () => {
    const recents = makeRecents(5);
    renderPage(recents);
    const countLine = screen.getByText(/Showing/).closest("p");
    expect(countLine).toHaveTextContent("Showing 1–5 of 5 Updates");
  });

  it("renders up to 10 cards on the first page", () => {
    renderPage(makeRecents(15));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
  });

  it("renders next page of cards when Next is clicked", async () => {
    renderPage(makeRecents(15));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });
};

const testSearchFiltering = () => {
  it("filters live by search query without needing Show Results", async () => {
    const user = userEvent.setup();
    renderPage([makeRecent("Alpha Update"), makeRecent("Beta Update")]);

    await user.type(screen.getByRole("searchbox"), "Alpha");

    expect(screen.getByRole("heading", { level: 3, name: "Alpha Update" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: "Beta Update" }),
    ).not.toBeInTheDocument();
  });
};

const testCategoryFiltering = () => {
  it("renders category checkboxes from categoryLabels", () => {
    renderPage([]);
    expect(screen.getByLabelText("Grants and Resources")).toBeInTheDocument();
    expect(screen.getByLabelText("Rules and Regulations")).toBeInTheDocument();
  });

  it("filters by category only after Show Results is clicked", async () => {
    const user = userEvent.setup();
    const recents = [
      makeRecent("Grant Update", { topics: "Grants and Resources" }),
      makeRecent("Rule Update", { topics: "Rules and Regulations" }),
    ];
    renderPage(recents);

    // Before Show Results: both cards visible
    expect(screen.getByText("Grant Update")).toBeInTheDocument();
    expect(screen.getByText("Rule Update")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Rules and Regulations"));

    // Pending: still both visible; button count reflects pending = 1
    expect(screen.getByText("Grant Update")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show 1 Results" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show 1 Results" }));

    // Applied: only Rule Update visible
    expect(screen.getByText("Rule Update")).toBeInTheDocument();
    expect(screen.queryByText("Grant Update")).not.toBeInTheDocument();
  });

  it("shows a Filtering by chip for an applied category filter", async () => {
    const user = userEvent.setup();
    renderPage([makeRecent("Grant Update", { topics: "Grants and Resources" })]);

    expect(screen.queryByText("Filtering by:")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Grants and Resources"));
    await user.click(screen.getByRole("button", { name: "Show 1 Results" }));

    expect(screen.getByText("Filtering by:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Grants and Resources filter" }),
    ).toBeInTheDocument();
  });
};

const testReset = () => {
  it("resets search, category filters, and page on Reset", async () => {
    const user = userEvent.setup();
    const recents = [
      makeRecent("Grant Update", { topics: "Grants and Resources" }),
      makeRecent("Rule Update", { topics: "Rules and Regulations" }),
    ];
    renderPage(recents);

    await user.type(screen.getByRole("searchbox"), "Grant");
    await user.click(screen.getByLabelText("Rules and Regulations"));
    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByLabelText("Rules and Regulations")).not.toBeChecked();
    expect(screen.getByText("Grant Update")).toBeInTheDocument();
    expect(screen.getByText("Rule Update")).toBeInTheDocument();
  });
};

const testSorting = () => {
  it("sorts alphabetically A-Z when selected", async () => {
    const user = userEvent.setup();
    renderPage([makeRecent("Zeta"), makeRecent("Alpha"), makeRecent("Mid")]);

    await user.selectOptions(screen.getByLabelText("Sort by:"), "A-Z");

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(["Alpha", "Mid", "Zeta"]);
  });

  it("sorts alphabetically Z-A when selected", async () => {
    const user = userEvent.setup();
    renderPage([makeRecent("Zeta"), makeRecent("Alpha"), makeRecent("Mid")]);

    await user.selectOptions(screen.getByLabelText("Sort by:"), "Z-A");

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(["Zeta", "Mid", "Alpha"]);
  });

  it("sorts by most recent date by default", () => {
    renderPage([
      makeRecent("Older", { date: "2020-01-01" }),
      makeRecent("Newer", { date: "2024-01-01" }),
    ]);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(["Newer", "Older"]);
  });
};

describe("UpdatesPageContent", () => {
  describe("static content and pagination", testStaticContentAndPagination);
  describe("search filtering", testSearchFiltering);
  describe("category filtering", testCategoryFiltering);
  describe("reset", testReset);
  describe("sorting", testSorting);
});

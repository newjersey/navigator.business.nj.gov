import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LicensingGuidePageMessages } from "@/domain/content/messageTypes";
import type { License, PageItem } from "@/domain/content/types";
import LicensingGuidePageContent from "./LicensingGuidePageContent";

const messages = {
  title: "Licensing and Certification Guide",
  ctaHeading: "Get Your Registration Guide!",
  ctaBody: "Start today!",
  ctaButton: "Get Started",
  filterHeading: "Narrow Results",
  filterSearch: "Search",
  filterShowResults: "Show {count} Results",
  filterReset: "Reset",
  resultCountShowing: "Showing <bold>{start}–{end}</bold> of {total} items",
  resultCountFiltered:
    "Showing <bold>{start}–{end}</bold> of {filtered} matching items (of {total} total)",
  resultCountFilteredEmpty: "0 matching items (of {total} total)",
  filteringByLabel: "Filtering by:",
  filterSearchChip: "Search: {query}",
  filterRemoveLabel: "Remove filter {filter}",
  paginationPrevious: "Previous",
  paginationNext: "Next",
  paginationLabel: "Pagination",
  paginationPageLabel: "Page {page}",
  cardWhoForLabel: "Who it's for:",
  cardIndustryLabel: "Industry:",
  cardAgencyLabel: "Agency:",
  cardPhoneLabel: "Phone:",
} as LicensingGuidePageMessages;

const page = {
  slug: "licensing-and-certification-guide",
  name: "Guide",
  "sub-heading-text": "Sub.",
} as PageItem;

const mk = (name: string): License => ({ name, urlSlug: name.toLowerCase().replace(/\s/g, "-") });

const renderPage = (licenses: License[]) =>
  render(<LicensingGuidePageContent messages={messages} page={page} licenses={licenses} />);

describe("LicensingGuidePageContent", () => {
  it("renders all cards initially", () => {
    renderPage([mk("Alpha License"), mk("Beta License")]);
    expect(screen.getByRole("heading", { level: 3, name: "Alpha License" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Beta License" })).toBeInTheDocument();
  });

  it("filters cards by search query", () => {
    renderPage([mk("Alpha License"), mk("Beta License")]);
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "Alpha" } });
    expect(screen.getByRole("heading", { level: 3, name: "Alpha License" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: "Beta License" }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty result count when nothing matches", () => {
    renderPage([mk("Alpha License")]);
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "zzz" } });
    expect(
      screen.queryByRole("heading", { level: 3, name: "Alpha License" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("0 matching items (of 1 total)")).toBeInTheDocument();
  });

  it("shows a search chip when query is non-empty and clears on remove", () => {
    renderPage([mk("Alpha License"), mk("Beta License")]);
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "transport" } });

    // Chip appears with the query text
    expect(screen.getByText("Search: transport")).toBeInTheDocument();

    // Click the remove button to clear the query
    const removeButton = screen.getByRole("button", {
      name: "Remove filter Search: transport",
    });
    fireEvent.click(removeButton);

    // Chip is gone and all cards return
    expect(screen.queryByText("Search: transport")).not.toBeInTheDocument();
    expect(screen.getByText("Alpha License")).toBeInTheDocument();
    expect(screen.getByText("Beta License")).toBeInTheDocument();
  });
});

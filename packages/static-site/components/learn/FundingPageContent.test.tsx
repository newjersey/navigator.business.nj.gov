import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import type { FundingPageMessages } from "@/domain/content/messageTypes";
import type { Funding, PageItem, Sector } from "@/domain/content/types";
import FundingPageContent from "./FundingPageContent";

const messages: FundingPageMessages = {
  title: "Funding",
  ctaHeading: "Find Funding Fit for Your Business",
  ctaBody: "Answers just a few questions.",
  ctaButton: "Create Account",
  filterHeading: "Filter All Funding Options",
  filterSearch: "Search",
  filterIndustry: "Industry",
  filterFundingType: "Funding Type",
  filterClear: "Clear",
  filterShowResults: "Show {count} Results",
  filterReset: "Reset",
  resultCount: "Showing <bold>{filtered}</bold> results of {total} items",
  filteringByLabel: "Filtering by:",
  filterRemoveLabel: "Remove {filter} filter",
  paginationPrevious: "Previous",
  paginationNext: "Next",
};

const renderWithIntl = (ui: ReactElement) =>
  render(
    <NextIntlClientProvider locale="en-US" messages={{ funding: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );

const page: PageItem = {
  name: "Funding",
  slug: "funding",
  "sub-heading-text": "Whether you're looking for startup capital...",
};

const makeFunding = (name: string, overrides: Partial<Funding> = {}): Funding =>
  ({
    id: name,
    filename: name,
    name,
    urlSlug: name,
    callToActionLink: "",
    callToActionText: "",
    sidebarCardBodyText: "",
    summaryDescriptionMd: "",
    contentMd: `## Eligibility\n\n- Eligible\n\n:::largeCallout{ showHeader="true" headerText="Benefits:" calloutType="conditional" }\n\nBenefit text.\n\n:::`,
    fundingType: "grant",
    agency: [],
    publishStageArchive: null,
    openDate: "",
    dueDate: "",
    status: "rolling application",
    programFrequency: "ongoing",
    businessStage: "both",
    employeesRequired: "n/a",
    homeBased: "unknown",
    certifications: [],
    preferenceForOpportunityZone: "no",
    county: [],
    sector: [],
    programPurpose: "",
    agencyContact: "",
    isNonprofitOnly: false,
    minEmployeesRequired: 0,
    maxEmployeesRequired: 0,
    priority: false,
    ...overrides,
  }) as Funding;

const sectors: Sector[] = [
  { id: "technology", name: "Technology", nonEssentialQuestionsIds: [], industries: [] },
  { id: "retail-trade", name: "Retail Trade", nonEssentialQuestionsIds: [], industries: [] },
];

const makeFundings = (count: number): Funding[] =>
  Array.from({ length: count }, (_, i) => makeFunding(`Funding ${String(i + 1).padStart(2, "0")}`));

describe("FundingPageContent", () => {
  it("renders the page title", () => {
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Funding" })).toBeInTheDocument();
  });

  it("renders intro text from page sub-heading-text", () => {
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />,
    );
    expect(screen.getByText("Whether you're looking for startup capital...")).toBeInTheDocument();
  });

  it("renders CTA heading and button", () => {
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />,
    );
    expect(screen.getByText("Find Funding Fit for Your Business")).toBeInTheDocument();
    const button = screen.getByRole("link", { name: "Create Account" });
    expect(button).toHaveAttribute("href", "https://account.business.nj.gov/");
  });

  it("renders result count with total fundings", () => {
    const fundings = makeFundings(5);
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    const countLine = screen.getByText(/Showing/).closest("p");
    expect(countLine).toHaveTextContent("Showing 5 results of 5 items");
    expect(countLine?.querySelector("strong")).toHaveTextContent("5");
  });

  it("renders up to 10 cards on the first page", () => {
    const fundings = makeFundings(15);
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
  });

  it("renders next page of cards when Next is clicked", async () => {
    const fundings = makeFundings(15);
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });

  it("Previous button is disabled on first page", () => {
    const fundings = makeFundings(15);
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("Next button is disabled on last page", async () => {
    const fundings = makeFundings(15);
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("renders filter sidebar heading", () => {
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />,
    );
    expect(screen.getByText("Filter All Funding Options")).toBeInTheDocument();
  });

  it("renders sector as industry checkbox", () => {
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />,
    );
    expect(screen.getByLabelText("Technology")).toBeInTheDocument();
  });

  it("filters by funding type only after Show Results is clicked", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Grant A", { fundingType: "grant" }),
      makeFunding("Loan B", { fundingType: "loan" }),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    // Before Show Results: both cards visible
    expect(screen.getByText("Grant A")).toBeInTheDocument();
    expect(screen.getByText("Loan B")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Grant"));

    // Pending: still both visible; button count reflects pending = 1
    expect(screen.getByText("Loan B")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show 1 Results" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show 1 Results" }));

    // Applied: only Grant A visible
    expect(screen.getByText("Grant A")).toBeInTheDocument();
    expect(screen.queryByText("Loan B")).not.toBeInTheDocument();
  });

  it("shows a Filtering by chip for each applied filter", async () => {
    const user = userEvent.setup();
    const fundings = [makeFunding("Grant A", { fundingType: "grant" })];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    // No chips before any filter applied
    expect(screen.queryByText("Filtering by:")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Grant"));
    await user.click(screen.getByRole("button", { name: "Show 1 Results" }));

    expect(screen.getByText("Filtering by:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Grant filter" })).toBeInTheDocument();
  });

  it("filters by specific industry sector", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Tech Funding", { sector: ["technology"] }),
      makeFunding("Retail Funding", { sector: ["retail-trade"] }),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    await user.click(screen.getByLabelText("Technology"));
    await user.click(screen.getByRole("button", { name: "Show 1 Results" }));

    expect(screen.getByText("Tech Funding")).toBeInTheDocument();
    expect(screen.queryByText("Retail Funding")).not.toBeInTheDocument();
  });

  it("removing a chip removes the filter immediately", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Grant A", { fundingType: "grant" }),
      makeFunding("Loan B", { fundingType: "loan" }),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    await user.click(screen.getByLabelText("Grant"));
    await user.click(screen.getByRole("button", { name: "Show 1 Results" }));
    expect(screen.queryByText("Loan B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove Grant filter" }));

    // Chip removed
    expect(screen.queryByRole("button", { name: "Remove Grant filter" })).not.toBeInTheDocument();
    expect(screen.queryByText("Filtering by:")).not.toBeInTheDocument();
    // Both cards visible again
    expect(screen.getByText("Grant A")).toBeInTheDocument();
    expect(screen.getByText("Loan B")).toBeInTheDocument();
    // Grant checkbox unticked
    expect((screen.getByLabelText("Grant") as HTMLInputElement).checked).toBe(false);
  });

  it("Show Results button label uses the pending filtered count", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Grant A", { fundingType: "grant" }),
      makeFunding("Grant B", { fundingType: "grant" }),
      makeFunding("Loan C", { fundingType: "loan" }),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    expect(screen.getByRole("button", { name: "Show 3 Results" })).toBeInTheDocument();

    await user.click(screen.getByLabelText("Grant"));
    expect(screen.getByRole("button", { name: "Show 2 Results" })).toBeInTheDocument();
  });

  it("Reset clears all pending and applied filters", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Grant A", { fundingType: "grant" }),
      makeFunding("Loan B", { fundingType: "loan" }),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    await user.click(screen.getByLabelText("Grant"));
    await user.click(screen.getByRole("button", { name: "Show 1 Results" }));
    expect(screen.queryByText("Loan B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("Loan B")).toBeInTheDocument();
    expect(screen.queryByText("Filtering by:")).not.toBeInTheDocument();
    expect((screen.getByLabelText("Grant") as HTMLInputElement).checked).toBe(false);
  });

  it("Clear inside the Industry fieldset clears pending only, not applied", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Tech Funding", { sector: ["technology"] }),
      makeFunding("Retail Funding", { sector: ["retail-trade"] }),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    // Apply Technology
    await user.click(screen.getByLabelText("Technology"));
    await user.click(screen.getByRole("button", { name: "Show 1 Results" }));
    expect(screen.queryByText("Retail Funding")).not.toBeInTheDocument();

    // Click Industry fieldset's Clear button (first of two Clear buttons in DOM order)
    const clearButtons = screen.getAllByRole("button", { name: "Clear" });
    await user.click(clearButtons[0]);

    // Applied results unchanged
    expect(screen.queryByText("Retail Funding")).not.toBeInTheDocument();
    // Chip still present (applied state untouched)
    expect(screen.getByRole("button", { name: "Remove Technology filter" })).toBeInTheDocument();
    // Technology checkbox unticked (pending state cleared)
    expect((screen.getByLabelText("Technology") as HTMLInputElement).checked).toBe(false);
  });
});

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
  fundingTypeLabels: {
    grant: "Grant",
    loan: "Loan",
    "tax credit": "Tax Credit",
    "tax exemption": "Tax Exemption",
    "technical assistance": "Technical Assistance",
    "hiring and employee training support": "Hiring & Employee Training Support",
  },
  filterClear: "Clear",
  filterShowResults: "Show {count} Results",
  filterReset: "Reset",
  resultCountShowing: "Showing <bold>{start}–{end}</bold> of {total} items",
  resultCountFiltered:
    "Showing <bold>{start}–{end}</bold> of {filtered} matching items (of {total} total)",
  resultCountFilteredEmpty: "0 matching items (of {total} total)",
  filteringByLabel: "Filtering by:",
  filterSearchChip: 'Search: "{query}"',
  filterRemoveLabel: "Remove {filter} filter",
  paginationPrevious: "Previous",
  paginationNext: "Next",
  paginationLabel: "Pagination",
  paginationPageLabel: "Page {page}",
  cardDueLabel: "Due:",
  cardEligibilityHeading: "Eligibility",
  cardBenefitsHeading: "Benefits",
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

describe("FundingPageContent static header and layout", () => {
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
    expect(button).toHaveAttribute("href", "https://account.business.nj.gov/onboarding");
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
});

describe("FundingPageContent result count", () => {
  it("renders result count with total fundings", () => {
    const fundings = makeFundings(5);
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    const countLine = screen.getByText(/Showing/).closest("p");
    expect(countLine).toHaveTextContent("Showing 1–5 of 5 items");
    expect(countLine?.querySelector("strong")).toHaveTextContent("1–5");
  });

  it("renders paginated and filtered result count with the grand total", async () => {
    const user = userEvent.setup();
    // 11 names contain "alpha" (spanning two pages); 4 do not.
    const fundings = [
      ...Array.from({ length: 11 }, (_, i) => makeFunding(`Alpha ${String(i + 1)}`)),
      ...Array.from({ length: 4 }, (_, i) => makeFunding(`Beta ${String(i + 1)}`)),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    await user.type(screen.getByRole("searchbox"), "alpha");

    const countLine = screen.getByText(/Showing/).closest("p");
    expect(countLine).toHaveTextContent("Showing 1–10 of 11 matching items (of 15 total)");
    expect(countLine?.querySelector("strong")).toHaveTextContent("1–10");
  });
});

describe("FundingPageContent pagination", () => {
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
});

describe("FundingPageContent checkbox filters", () => {
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
});

describe("FundingPageContent clearing filters", () => {
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

  it("Reset clears all pending, applied, and search filters", async () => {
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
    await user.type(screen.getByRole("searchbox"), "grant");
    expect(screen.queryByText("Loan B")).not.toBeInTheDocument();
    expect(screen.getByText('Search: "grant"')).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("Loan B")).toBeInTheDocument();
    expect(screen.queryByText("Filtering by:")).not.toBeInTheDocument();
    expect((screen.getByLabelText("Grant") as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
  });
});

describe("FundingPageContent filtering-by chips", () => {
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

  it("shows a removable search chip whose x clears the query", async () => {
    const user = userEvent.setup();
    const fundings = [makeFunding("Grant Alpha"), makeFunding("Loan Beta")];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    await user.type(screen.getByRole("searchbox"), "alpha");
    expect(screen.getByText('Search: "alpha"')).toBeInTheDocument();
    expect(screen.queryByText("Loan Beta")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: 'Remove Search: "alpha" filter' }));

    expect(screen.queryByText('Search: "alpha"')).not.toBeInTheDocument();
    expect(screen.getByText("Loan Beta")).toBeInTheDocument();
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
  });
});

describe("FundingPageContent free-text search", () => {
  it("filters cards live by name as the user types, without clicking a button", async () => {
    const user = userEvent.setup();
    const fundings = [makeFunding("Grant Alpha"), makeFunding("Loan Beta")];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    await user.type(screen.getByRole("searchbox"), "alpha");

    expect(screen.getByRole("heading", { name: "Grant Alpha" })).toBeInTheDocument();
    expect(screen.queryByText("Loan Beta")).not.toBeInTheDocument();
  });

  it("matches case-insensitively against the funding body text", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Alpha", {
        contentMd: `## Eligibility\n\n- Must be WIDGET maker\n\n:::largeCallout{ showHeader="true" headerText="Benefits:" calloutType="conditional" }\n\nGreat benefit.\n\n:::`,
      }),
      makeFunding("Beta"),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    await user.type(screen.getByRole("searchbox"), "widget");

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  it("Show Results button count reflects the active search query", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Grant Alpha", { fundingType: "grant" }),
      makeFunding("Grant Beta", { fundingType: "grant" }),
      makeFunding("Loan Alpha", { fundingType: "loan" }),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    expect(screen.getByRole("button", { name: "Show 3 Results" })).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox"), "alpha");

    // Only "Grant Alpha" and "Loan Alpha" match the query.
    expect(screen.getByRole("button", { name: "Show 2 Results" })).toBeInTheDocument();

    await user.click(screen.getByLabelText("Grant"));

    // grant AND "alpha" -> only "Grant Alpha".
    expect(screen.getByRole("button", { name: "Show 1 Results" })).toBeInTheDocument();
  });
});

describe("FundingPageContent combined search and checkbox filters", () => {
  it("AND-combines the search query with applied checkbox filters", async () => {
    const user = userEvent.setup();
    const fundings = [
      makeFunding("Grant Alpha", { fundingType: "grant" }),
      makeFunding("Grant Beta", { fundingType: "grant" }),
      makeFunding("Loan Alpha", { fundingType: "loan" }),
    ];
    renderWithIntl(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );

    await user.click(screen.getByLabelText("Grant"));
    await user.click(screen.getByRole("button", { name: "Show 2 Results" }));
    await user.type(screen.getByRole("searchbox"), "alpha");

    // grant AND "alpha" -> only "Grant Alpha"
    expect(screen.getByRole("heading", { name: "Grant Alpha" })).toBeInTheDocument();
    expect(screen.queryByText("Grant Beta")).not.toBeInTheDocument();
    expect(screen.queryByText("Loan Alpha")).not.toBeInTheDocument();
  });
});

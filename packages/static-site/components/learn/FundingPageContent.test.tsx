import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  resultCount: "Showing {count} items",
  paginationPrevious: "Previous",
  paginationNext: "Next",
};

const page: PageItem = {
  name: "Funding",
  slug: "funding",
  "sub-heading-text": "Whether you're looking for startup capital...",
};

const makeFunding = (name: string): Funding =>
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
  }) as Funding;

const sectors: Sector[] = [
  { id: "technology", name: "Technology", nonEssentialQuestionsIds: [], industries: [] },
];

const makeFundings = (count: number): Funding[] =>
  Array.from({ length: count }, (_, i) => makeFunding(`Funding ${String(i + 1).padStart(2, "0")}`));

describe("FundingPageContent", () => {
  it("renders the page title", () => {
    render(<FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />);
    expect(screen.getByRole("heading", { level: 1, name: "Funding" })).toBeInTheDocument();
  });

  it("renders intro text from page sub-heading-text", () => {
    render(<FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />);
    expect(screen.getByText("Whether you're looking for startup capital...")).toBeInTheDocument();
  });

  it("renders CTA heading and button", () => {
    render(<FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />);
    expect(screen.getByText("Find Funding Fit for Your Business")).toBeInTheDocument();
    const button = screen.getByRole("link", { name: "Create Account" });
    expect(button).toHaveAttribute("href", "https://account.business.nj.gov/");
  });

  it("renders result count with total fundings", () => {
    const fundings = makeFundings(5);
    render(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    expect(screen.getByText("Showing 5 items")).toBeInTheDocument();
  });

  it("renders up to 10 cards on the first page", () => {
    const fundings = makeFundings(15);
    render(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
  });

  it("renders next page of cards when Next is clicked", async () => {
    const fundings = makeFundings(15);
    render(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });

  it("Previous button is disabled on first page", () => {
    const fundings = makeFundings(15);
    render(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("Next button is disabled on last page", async () => {
    const fundings = makeFundings(15);
    render(
      <FundingPageContent messages={messages} page={page} fundings={fundings} sectors={sectors} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("renders filter sidebar heading", () => {
    render(<FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />);
    expect(screen.getByText("Filter All Funding Options")).toBeInTheDocument();
  });

  it("renders sector as industry checkbox", () => {
    render(<FundingPageContent messages={messages} page={page} fundings={[]} sectors={sectors} />);
    expect(screen.getByLabelText("Technology")).toBeInTheDocument();
  });
});

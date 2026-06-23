import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Funding } from "@/domain/content/types";
import FundingCard from "./FundingCard";

const funding = (overrides: Partial<Funding> = {}): Funding =>
  ({
    id: "test-funding",
    filename: "test-funding",
    name: "Test Funding Program",
    urlSlug: "test-funding",
    callToActionLink: "https://example.com",
    callToActionText: "Learn more",
    sidebarCardBodyText: "A short description.",
    summaryDescriptionMd: "Summary text.",
    contentMd: `## Eligibility\n\n- Must be NJ registered\n\n:::largeCallout{ showHeader="true" headerText="Benefits:" calloutType="conditional" }\n\nThe benefit is great.\n\n:::`,
    fundingType: "grant",
    agency: ["njeda"],
    publishStageArchive: "",
    openDate: "",
    dueDate: "",
    status: "rolling application",
    programFrequency: "ongoing",
    businessStage: "both",
    employeesRequired: "n/a",
    homeBased: "unknown",
    certifications: [],
    preferenceForOpportunityZone: "no",
    county: ["All"],
    sector: [],
    programPurpose: "",
    agencyContact: "",
    isNonprofitOnly: false,
    minEmployeesRequired: 0,
    maxEmployeesRequired: 0,
    priority: false,
    ...overrides,
  }) as Funding;

describe("FundingCard", () => {
  it("renders the funding name as a heading", () => {
    render(<FundingCard funding={funding()} />);
    expect(screen.getByRole("heading", { name: "Test Funding Program" })).toBeInTheDocument();
  });

  it("renders status badge uppercased", () => {
    render(<FundingCard funding={funding({ status: "rolling application" })} />);
    expect(screen.getByText("ROLLING APPLICATION")).toBeInTheDocument();
  });

  it("renders funding type badge uppercased", () => {
    render(<FundingCard funding={funding({ fundingType: "grant" })} />);
    expect(screen.getByText("GRANT")).toBeInTheDocument();
  });

  it("renders eligibility bullet from contentMd", () => {
    render(<FundingCard funding={funding()} />);
    expect(screen.getByText(/Must be NJ registered/)).toBeInTheDocument();
  });

  it("renders benefits callout from contentMd", () => {
    render(<FundingCard funding={funding()} />);
    expect(screen.getByText(/The benefit is great/)).toBeInTheDocument();
  });

  it("renders Benefits heading on the callout box", () => {
    render(<FundingCard funding={funding()} />);
    expect(screen.getByRole("heading", { name: "Benefits" })).toBeInTheDocument();
  });

  it("does not render status badge when status is empty", () => {
    render(
      <FundingCard funding={funding({ status: undefined as unknown as "rolling application" })} />,
    );
    expect(screen.queryByText("ROLLING APPLICATION")).not.toBeInTheDocument();
  });

  it("renders due date when present", () => {
    render(<FundingCard funding={funding({ dueDate: "2026-12-31" })} />);
    expect(screen.getByText(/2026-12-31/)).toBeInTheDocument();
  });
});

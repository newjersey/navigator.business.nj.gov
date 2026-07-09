import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import type { FundingPageMessages } from "@/domain/content/messageTypes";
import type { Funding } from "@/domain/content/types";
import FundingCard from "./FundingCard";

const cardMessages = {
  cardDueLabel: "Due:",
  cardEligibilityHeading: "Eligibility",
  cardBenefitsHeading: "Benefits",
} as FundingPageMessages;

const renderCard = (props: Omit<ComponentProps<typeof FundingCard>, "messages">) =>
  render(<FundingCard messages={cardMessages} {...props} />);

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
    renderCard({ funding: funding() });
    expect(screen.getByRole("heading", { name: "Test Funding Program" })).toBeInTheDocument();
  });

  it("renders status badge uppercased", () => {
    renderCard({ funding: funding({ status: "rolling application" }) });
    expect(screen.getByText("ROLLING APPLICATION")).toBeInTheDocument();
  });

  it("renders a base-light divider between the card header and body", () => {
    const { container } = renderCard({ funding: funding() });
    const divider = container.querySelector("hr.border-base-light");
    expect(divider).not.toBeNull();
    // The divider sits between the header and the body.
    expect(divider?.previousElementSibling?.classList.contains("usa-card__header")).toBe(true);
    expect(divider?.nextElementSibling?.classList.contains("usa-card__body")).toBe(true);
  });

  it("renders funding type badge uppercased", () => {
    renderCard({ funding: funding({ fundingType: "grant" }) });
    expect(screen.getByText("GRANT")).toBeInTheDocument();
  });

  it("renders eligibility bullet from contentMd", () => {
    renderCard({ funding: funding() });
    expect(screen.getByText(/Must be NJ registered/)).toBeInTheDocument();
  });

  it("renders benefits callout from contentMd", () => {
    renderCard({ funding: funding() });
    expect(screen.getByText(/The benefit is great/)).toBeInTheDocument();
  });

  it("renders Benefits heading on the callout box", () => {
    renderCard({ funding: funding() });
    expect(screen.getByRole("heading", { name: "Benefits" })).toBeInTheDocument();
  });

  it("does not render status badge when status is empty", () => {
    renderCard({
      funding: funding({ status: undefined as unknown as "rolling application" }),
    });
    expect(screen.queryByText("ROLLING APPLICATION")).not.toBeInTheDocument();
  });

  it("renders due date when present", () => {
    renderCard({ funding: funding({ dueDate: "2026-12-31" }) });
    expect(screen.getByText(/2026-12-31/)).toBeInTheDocument();
  });

  it("highlights a query match in the funding name", () => {
    renderCard({ funding: funding({ name: "Grant Program" }), query: "grant" });
    const heading = screen.getByRole("heading", { name: "Grant Program" });
    const mark = heading.querySelector("mark.funding-search-highlight");
    expect(mark).not.toBeNull();
    expect(mark).toHaveTextContent("Grant");
  });

  it("highlights a query match in the eligibility body", () => {
    const { container } = renderCard({ funding: funding(), query: "registered" });
    const marks = container.querySelectorAll("mark.funding-search-highlight");
    expect([...marks].some((m) => m.textContent === "registered")).toBe(true);
  });

  it("highlights a query match in the benefits body", () => {
    const { container } = renderCard({ funding: funding(), query: "benefit" });
    const marks = container.querySelectorAll("mark.funding-search-highlight");
    expect([...marks].some((m) => m.textContent === "benefit")).toBe(true);
  });

  it("preserves markdown list structure in benefits when a query is active", () => {
    const withList = funding({
      contentMd: `## Eligibility\n\n- Must be NJ registered\n\n:::largeCallout{ showHeader="true" headerText="Benefits:" calloutType="conditional" }\n\n- Benefit one\n- Benefit two\n\n:::`,
    });
    const { container } = renderCard({ funding: withList, query: "benefit" });
    const benefitsBox = container.querySelector('[role="note"]');
    expect(benefitsBox?.querySelector("ul")).not.toBeNull();
  });

  it("renders no highlight marks when no query is given", () => {
    const { container } = renderCard({ funding: funding() });
    expect(container.querySelector("mark.funding-search-highlight")).toBeNull();
  });

  it("keeps markdown rendering for a whitespace-only query", () => {
    const { container } = renderCard({ funding: funding(), query: "   " });
    // A whitespace-only query matches and highlights nothing, so the
    // Eligibility section should stay in its <Markdown> rendering (a list)
    // rather than the plain-text fallback used while actively searching.
    expect(container.querySelector("ul")).not.toBeNull();
    expect(container.querySelector("mark.funding-search-highlight")).toBeNull();
  });
});

describe("FundingCard callToActionLink", () => {
  it("links the funding name to callToActionLink in a new tab", () => {
    renderCard({ funding: funding({ callToActionLink: "https://example.com/apply" }) });
    const link = screen.getByRole("link", { name: "Test Funding Program" });
    expect(link).toHaveAttribute("href", "https://example.com/apply");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("renders the funding name as plain text when callToActionLink is empty", () => {
    renderCard({ funding: funding({ callToActionLink: "" }) });
    expect(screen.getByRole("heading", { name: "Test Funding Program" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Test Funding Program" })).not.toBeInTheDocument();
  });

  it("highlights a query match inside the linked funding name", () => {
    renderCard({
      funding: funding({ name: "Grant Program", callToActionLink: "https://example.com" }),
      query: "grant",
    });
    const link = screen.getByRole("link", { name: "Grant Program" });
    const mark = link.querySelector("mark.funding-search-highlight");
    expect(mark).not.toBeNull();
    expect(mark).toHaveTextContent("Grant");
  });
});

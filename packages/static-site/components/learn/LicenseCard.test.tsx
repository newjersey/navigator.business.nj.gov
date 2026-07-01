import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import type { LicensingGuidePageMessages } from "@/domain/content/messageTypes";
import type { License } from "@/domain/content/types";
import LicenseCard from "./LicenseCard";

const messages = {
  cardWhoForLabel: "Who it's for:",
  cardIndustryLabel: "Industry:",
  cardAgencyLabel: "Agency:",
  cardPhoneLabel: "Phone:",
} as LicensingGuidePageMessages;

const license = (overrides: Partial<License> = {}): License => ({
  name: "A-901 License to Transport Waste",
  urlSlug: "a-901-license-to-transport-waste",
  webflowType: "business-license",
  industry: "Waste",
  summaryDescriptionMd: "You need an A-901 license to transport waste.",
  agency: "NJ Division of Consumer Affairs",
  division: "Board of Accountancy",
  divisionPhone: "(973) 504-6380",
  callToActionText: "Apply for My A-901 License",
  callToActionLink: "https://example.com",
  ...overrides,
});

const renderCard = (props: Partial<ComponentProps<typeof LicenseCard>> = {}) =>
  render(<LicenseCard messages={messages} license={license()} {...props} />);

describe("LicenseCard", () => {
  it("renders title, meta, agency, phone, and CTA", () => {
    renderCard();
    expect(screen.getByText("A-901 License to Transport Waste")).toBeInTheDocument();
    expect(screen.getByText(/Who it's for:/)).toBeInTheDocument();
    expect(screen.getByText(/NJ Division of Consumer Affairs/)).toBeInTheDocument();
    expect(screen.getByText("(973) 504-6380")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: "Apply for My A-901 License" });
    expect(cta).toHaveAttribute("href", "https://example.com");
  });

  it("maps webflowType to its 'Who it's for' display label", () => {
    const { container } = renderCard({ license: license({ webflowType: "individual-license" }) });
    expect(screen.getByText(/Who it's for:/)).toBeInTheDocument();
    expect(container.querySelector(".usa-card__header p")?.textContent).toContain("Individuals");
  });

  it("omits the 'Who it's for' row when webflowType is unknown or missing", () => {
    renderCard({ license: license({ webflowType: undefined }) });
    expect(screen.queryByText(/Who it's for:/)).not.toBeInTheDocument();
  });

  it("omits the Industry row when the value is the literal string 'undefined'", () => {
    renderCard({ license: license({ webflowType: undefined, industry: "undefined" }) });
    expect(screen.queryByText(/Industry:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it("omits the Industry row when the value is empty or whitespace", () => {
    renderCard({ license: license({ webflowType: undefined, industry: "   " }) });
    expect(screen.queryByText(/Industry:/)).not.toBeInTheDocument();
  });

  it("omits the entire meta line when neither classification nor industry is present", () => {
    const { container } = renderCard({
      license: license({ webflowType: undefined, industry: undefined }),
    });
    expect(screen.queryByText(/Who it's for:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Industry:/)).not.toBeInTheDocument();
    expect(container.querySelector(".usa-card__header p")).toBeNull();
  });

  it("omits the CTA when no link is present", () => {
    renderCard({ license: license({ callToActionLink: undefined }) });
    expect(screen.queryByRole("link", { name: /Apply/ })).not.toBeInTheDocument();
  });

  it("highlights a query match in the summary body", () => {
    const { container } = renderCard({
      license: license({ summaryDescriptionMd: "You need a license to transport waste." }),
      query: "transport",
    });
    const marks = container.querySelectorAll("mark.funding-search-highlight");
    expect([...marks].some((m) => m.textContent === "transport")).toBe(true);
  });

  it("renders no highlight marks in the body when no query is given", () => {
    const { container } = renderCard({
      license: license({ summaryDescriptionMd: "You need a license to transport waste." }),
    });
    expect(container.querySelector(".usa-card__body mark.funding-search-highlight")).toBeNull();
  });

  it("unwraps CMS directives in the summary instead of showing raw ::: fences", () => {
    renderCard({
      license: license({
        summaryDescriptionMd: [
          ":::infoAlert",
          "**Keep in mind:** the A-901 process takes 14 to 16 months.",
          ":::",
          "",
          "You need an A-901 license to transport waste.",
        ].join("\n"),
      }),
    });
    expect(screen.queryByText(/:::/)).not.toBeInTheDocument();
    expect(screen.getByText(/the A-901 process takes 14 to 16 months/)).toBeInTheDocument();
    expect(screen.getByText(/You need an A-901 license to transport waste/)).toBeInTheDocument();
  });

  it("does not render a leading separator when industry has no classification", () => {
    renderCard({
      license: license({ webflowType: undefined, industry: "Credit Union" }),
    });
    expect(screen.queryByText(/Who it's for:/)).not.toBeInTheDocument();
    // The "|" separator must not appear when only Industry is present.
    expect(screen.queryByText(/\|/)).not.toBeInTheDocument();
    expect(screen.getByText(/Industry:/)).toBeInTheDocument();
  });

  it("renders the separator only when both classification and industry are present", () => {
    renderCard({ license: license({ webflowType: "business-license", industry: "Waste" }) });
    expect(screen.getByText(/Who it's for:/)).toBeInTheDocument();
    expect(screen.getByText(/Industry:/)).toBeInTheDocument();
    expect(screen.getByText(/\|/)).toBeInTheDocument();
  });
});

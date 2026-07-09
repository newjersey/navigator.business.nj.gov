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
  whoItsForLabels: {
    "business-license": "Businesses",
    "individual-license": "Individuals",
    "object-vehicle": "Object/Vehicle",
  },
  // Only the card-relevant fields are supplied; the bridge cast marks this as a
  // deliberate subset of the full page messages.
} as unknown as LicensingGuidePageMessages;

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

  it("renders the agency name and additional context comma-joined when both are present", () => {
    renderCard({
      license: license({
        agency: "Department of Agriculture",
        division: "Division of Animal Health",
      }),
    });
    expect(
      screen.getByText(/Department of Agriculture, Division of Animal Health/),
    ).toBeInTheDocument();
  });

  it("renders only the agency name when no additional context is present", () => {
    renderCard({ license: license({ agency: "Federal Trade Commission", division: undefined }) });
    expect(screen.getByText(/Federal Trade Commission/)).toBeInTheDocument();
    expect(screen.queryByText(/,/)).not.toBeInTheDocument();
  });

  it("renders only the additional context when the agency name is absent", () => {
    renderCard({ license: license({ agency: undefined, division: "Office of Licensing" }) });
    expect(screen.getByText(/Office of Licensing/)).toBeInTheDocument();
    expect(screen.queryByText(/,/)).not.toBeInTheDocument();
  });

  it("links the agency name to the agency website, keeping the division as plain text", () => {
    renderCard({
      license: license({
        agency: "Department of Agriculture",
        division: "Division of Animal Health",
        agencyWebsite: "https://www.nj.gov/agriculture/",
      }),
    });
    const link = screen.getByRole("link", { name: "Department of Agriculture" });
    expect(link).toHaveAttribute("href", "https://www.nj.gov/agriculture/");
    // External agency site opens in a new tab, matching the published site and
    // the sibling funding card convention.
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    // The division stays plain text, not part of the link.
    expect(screen.getByText(/, Division of Animal Health/)).toBeInTheDocument();
  });

  it("renders the agency name as plain text when there is no agency website", () => {
    renderCard({
      license: license({ agency: "Federal Trade Commission", agencyWebsite: undefined }),
    });
    expect(
      screen.queryByRole("link", { name: "Federal Trade Commission" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Federal Trade Commission/)).toBeInTheDocument();
  });

  it("prefixes agency with the account_balance icon and phone with the phone icon", () => {
    const { container } = renderCard();
    const hrefs = [...container.querySelectorAll("use")].map((u) => u.getAttribute("href"));
    expect(hrefs).toContain("/assets/njwds/dist/img/sprite.svg#account_balance");
    expect(hrefs).toContain("/assets/njwds/dist/img/sprite.svg#phone");
  });

  it("maps webflowType to its 'Who it's for' display label", () => {
    const { container } = renderCard({ license: license({ webflowType: "individual-license" }) });
    expect(screen.getByText(messages.cardWhoForLabel)).toBeInTheDocument();
    expect(container.querySelector(".usa-card__header p")?.textContent).toContain(
      messages.whoItsForLabels["individual-license"],
    );
  });

  it("omits the 'Who it's for' row when webflowType is unknown or missing", () => {
    renderCard({ license: license({ webflowType: undefined }) });
    expect(screen.queryByText(messages.cardWhoForLabel)).not.toBeInTheDocument();
  });

  it("omits the Industry row when the value is the literal string 'undefined'", () => {
    renderCard({ license: license({ webflowType: undefined, industry: "undefined" }) });
    expect(screen.queryByText(messages.cardIndustryLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it("omits the Industry row when the value is empty or whitespace", () => {
    renderCard({ license: license({ webflowType: undefined, industry: "   " }) });
    expect(screen.queryByText(messages.cardIndustryLabel)).not.toBeInTheDocument();
  });

  it("omits the entire meta line when neither classification nor industry is present", () => {
    const { container } = renderCard({
      license: license({ webflowType: undefined, industry: undefined }),
    });
    expect(screen.queryByText(messages.cardWhoForLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(messages.cardIndustryLabel)).not.toBeInTheDocument();
    expect(container.querySelector(".usa-card__header p")).toBeNull();
  });

  it("omits the CTA when no link is present", () => {
    renderCard({ license: license({ callToActionLink: undefined }) });
    expect(screen.queryByRole("link", { name: /Apply/ })).not.toBeInTheDocument();
  });

  it("omits the CTA when the link or text still holds an unresolved template placeholder", () => {
    // Location-dependent roadmap tasks (e.g. short-term-rental-registration)
    // carry `${municipalityWebsite}` / `${municipalityName}` template variables
    // that only the personalized `web/` roadmap fills in. On this static
    // directory they never resolve. The button would render dead, so we omit the CTA.
    const { container } = renderCard({
      license: license({
        // biome-ignore-start lint/suspicious/noTemplateCurlyInString: the unresolved literal placeholder is the input under test
        callToActionText: "Visit the ${municipalityName} Website",
        callToActionLink: "${municipalityWebsite}",
        // biome-ignore-end lint/suspicious/noTemplateCurlyInString: the unresolved literal placeholder is the input under test
      }),
    });
    expect(container.querySelector(".usa-card__footer")).toBeNull();
    expect(screen.queryByText(/\$\{/)).not.toBeInTheDocument();
  });

  it("renders the summary/agency divider when only division context is present", () => {
    // A card with division context (agencyAdditionalContext) but no agency name
    // and no phone still renders an agency line, so the divider above it must
    // render too. Keyed off the same value that gates the line, not agency alone.
    const { container } = renderCard({
      license: license({
        agency: undefined,
        division: "Your Municipality",
        divisionPhone: undefined,
        summaryDescriptionMd: "You may need to register with your municipal clerk.",
      }),
    });
    expect(screen.getByText(/Your Municipality/)).toBeInTheDocument();
    expect(container.querySelector("hr.margin-x-0")).not.toBeNull();
  });

  it("renders a base-light divider between the card header and body", () => {
    const { container } = renderCard();
    const divider = container.querySelector("hr.border-base-light");
    expect(divider).not.toBeNull();
    expect(divider?.previousElementSibling?.classList.contains("usa-card__header")).toBe(true);
    expect(divider?.nextElementSibling?.classList.contains("usa-card__body")).toBe(true);
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

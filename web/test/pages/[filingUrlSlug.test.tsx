import { getMergedConfig } from "@/contexts/configContext";
import { Filing, taxFilingMethod } from "@/lib/types/types";
import FilingPage from "@/pages/filings/[filingUrlSlug]";
import { generateProfileData, generateTaxFiling, generateTaxFilingData } from "@/test/factories";
import { randomElementFromArray } from "@/test/helpers";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { randomInt } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
const Config = getMergedConfig();

describe("filing page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const generateFiling = (overrides: Partial<Filing>): Filing => {
    const id = randomInt(4);
    return {
      id: `filing-identifier-${id}`,
      filename: `filename-${id}`,
      name: `filing-name-${id}`,
      urlSlug: `url-slug-${id}`,
      callToActionLink: `cta-link-${id}`,
      callToActionText: `cta-text-${id}`,
      contentMd: `content-${id}`,
      extension: randomInt() % 2 ? true : false,
      filingMethod: randomElementFromArray([...taxFilingMethod]),
      frequency: `frequency-${id}`,
      filingDetails: `filingDetails-${id}`,
      treasuryLink: `https://www.treasuryLink-${id}.com`,
      taxRates: `taxRates-${id}`,
      additionalInfo: `additionalInfo-${id}`,
      agency: randomInt() % 2 ? "New Jersey Division of Taxation" : undefined,
      ...overrides,
    };
  };

  it("shows the basic filing details and correct due date", () => {
    useMockUserData({
      profileData: generateProfileData({ entityId: "1234567890" }),
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFiling({}),
          generateTaxFiling({ identifier: "filing-identifier-1", dueDate: "2022-04-30" }),
        ],
      }),
    });

    const filing = generateFiling({
      id: "filing-identifier-1",
      filename: "filename-1",
      name: "filing-name-1",
      urlSlug: "url-slug-1",
      callToActionLink: "cta-link-1",
      callToActionText: "cta-text-1",
      contentMd: "content-1",
      filingMethod: undefined,
      extension: undefined,
      treasuryLink: undefined,
      taxRates: undefined,
      additionalInfo: undefined,
      agency: undefined,
    });

    render(<FilingPage filing={filing} operateReferences={{}} />);

    expect(screen.getByText("filing-name-1")).toBeInTheDocument();
    expect(screen.getByText("cta-text-1")).toBeInTheDocument();
    expect(screen.getByText("content-1")).toBeInTheDocument();
    expect(screen.getByText("filing-identifier-1")).toBeInTheDocument();
    expect(screen.getByTestId("due-date")).toHaveTextContent("APRIL 30, 2022");
    expect(screen.queryByTestId("filing-method")).not.toBeInTheDocument();
    expect(screen.queryByTestId("filing-details")).not.toBeInTheDocument();
    expect(screen.queryByTestId("extension")).not.toBeInTheDocument();
    expect(screen.queryByTestId("treasury-link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tax-rates")).not.toBeInTheDocument();
    expect(screen.queryByTestId("additional-info")).not.toBeInTheDocument();
    expect(screen.queryByTestId("agency-header")).not.toBeInTheDocument();
  });

  it("shows the full filing details and correct due date", () => {
    useMockUserData({
      profileData: generateProfileData({ entityId: "1234567890" }),
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFiling({}),
          generateTaxFiling({ identifier: "filing-identifier-1", dueDate: "2022-04-30" }),
        ],
      }),
    });

    const filing: Filing = generateFiling({
      id: "filing-identifier-1",
      name: "filing-name-1",
      callToActionText: "cta-text-1",
      contentMd: "content-1",
      extension: true,
      filingMethod: "paper-or-by-mail-only",
      frequency: "every day, all day",
      filingDetails: "please file this way",
      treasuryLink: "https://www.google.com",
      taxRates: "tax rate stuff",
      additionalInfo: "additional info stuff",
      agency: "New Jersey Division of Taxation",
    });

    render(<FilingPage filing={filing} operateReferences={{}} />);

    expect(screen.getByText("filing-name-1")).toBeInTheDocument();
    expect(screen.getByText("cta-text-1")).toBeInTheDocument();
    expect(screen.getByText("content-1")).toBeInTheDocument();
    expect(screen.getByText("filing-identifier-1")).toBeInTheDocument();
    expect(screen.getByTestId("due-date")).toHaveTextContent("APRIL 30, 2022");
    expect(screen.getByText(Config.filingDefaults.paperOrMailOnlyTaxFilingMethod)).toBeInTheDocument();
    expect(screen.getByText("every day, all day")).toBeInTheDocument();
    expect(screen.getByText("please file this way")).toBeInTheDocument();
    expect(screen.getByText(Config.filingDefaults.extensionTagText)).toBeInTheDocument();
    expect(screen.getByTestId("treasury-link")).toHaveTextContent(Config.filingDefaults.treasuryLinkText);
    expect(screen.getByText("tax rate stuff")).toBeInTheDocument();
    expect(screen.getByText("additional info stuff")).not.toBeVisible();
    fireEvent.click(screen.getByText(Config.filingDefaults.additionalInfo));
    expect(screen.getByText("additional info stuff")).toBeVisible();
    expect(screen.getByText("New Jersey Division of Taxation")).toBeInTheDocument();
  });
});

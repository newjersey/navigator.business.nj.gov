import { getMergedConfig } from "@/contexts/configContext";
import { Filing, taxFilingMethod } from "@/lib/types/types";
import FilingPage from "@/pages/filings/[filingUrlSlug]";
import { generateProfileData, generateTaxFiling, generateTaxFilingData } from "@/test/factories";
import { randomElementFromArray } from "@/test/helpers";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { defaultDateFormat, getCurrentDate, randomInt } from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
const Config = getMergedConfig();

describe("filing page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderFilingPage = (filing: Filing) => {
    render(
      <ThemeProvider theme={createTheme()}>
        <FilingPage filing={filing} />
      </ThemeProvider>
    );
  };

  const generateFiling = (overrides: Partial<Filing>): Filing => {
    const id = randomInt(4);
    return {
      id: `id identifier ${id}`,
      filename: `filename-${id}`,
      name: `filing-name-${id}`,
      urlSlug: `url-slug-${id}`,
      callToActionLink: `cta-link-${id}`,
      callToActionText: `cta-text-${id}`,
      contentMd: `content-${id}`,
      extension: !!(randomInt() % 2),
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
      urlSlug: "filing-url-slug-1",
      id: "filing-identifier-1",
      filename: "filename-1",
      name: "filing-name-1",
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

    renderFilingPage(filing);

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

  it("shows correct date for a filing id with spaces in it", () => {
    useMockUserData({
      profileData: generateProfileData({ entityId: "1234567890" }),
      taxFilingData: generateTaxFilingData({
        filings: [generateTaxFiling({ identifier: "filing id", dueDate: "2022-04-30" })],
      }),
    });

    const filing = generateFiling({ id: "filing id" });
    renderFilingPage(filing);

    expect(screen.getByText("filing id")).toBeInTheDocument();
    expect(screen.getByTestId("due-date")).toHaveTextContent("APRIL 30, 2022");
  });

  it("shows the full filing details and correct due date", () => {
    useMockUserData({
      profileData: generateProfileData({ entityId: "1234567890" }),
      taxFilingData: generateTaxFilingData({
        filings: [generateTaxFiling({}), generateTaxFiling({ identifier: "filing-identifier-1" })],
      }),
    });

    const filing: Filing = generateFiling({
      urlSlug: "filing-identifier-1",
      extension: true,
      filingMethod: "paper-or-by-mail-only",
      frequency: "every day, all day",
      filingDetails: "please file this way",
      treasuryLink: "https://www.google.com",
      taxRates: "tax rate stuff",
      additionalInfo: "additional info stuff",
      agency: "New Jersey Division of Taxation",
    });

    renderFilingPage(filing);

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
    expect(screen.getByTestId("late-filing")).toBeInTheDocument();
  });

  it("hides late filing content when not New Jersey Division of Taxation", () => {
    useMockUserData({
      profileData: generateProfileData({ entityId: "1234567890" }),
      taxFilingData: generateTaxFilingData({
        filings: [generateTaxFiling({}), generateTaxFiling({ identifier: "filing-identifier-1" })],
      }),
    });

    const filing: Filing = generateFiling({
      urlSlug: "filing-identifier-1",
      agency: "Internal Revenue Service (IRS)",
    });

    renderFilingPage(filing);
    expect(screen.queryByTestId("late-filing")).not.toBeInTheDocument();
  });

  it("returns the most recent tax deadline date", () => {
    const closestDate = getCurrentDate().add(1, "day");

    useMockUserData({
      profileData: generateProfileData({ entityId: "1234567890" }),
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFiling({
            identifier: "filing-identifier-1",
            dueDate: getCurrentDate().add(2, "month").format(defaultDateFormat),
          }),
          generateTaxFiling({
            identifier: "filing-identifier-1",
            dueDate: getCurrentDate().add(3, "month").format(defaultDateFormat),
          }),
          generateTaxFiling({
            identifier: "filing-identifier-1",
            dueDate: getCurrentDate().add(8, "month").format(defaultDateFormat),
          }),
          generateTaxFiling({
            identifier: "filing-identifier-1",
            dueDate: getCurrentDate().add(1, "month").format(defaultDateFormat),
          }),
          generateTaxFiling({
            identifier: "filing-identifier-1",
            dueDate: closestDate.format(defaultDateFormat),
          }),
          generateTaxFiling({
            identifier: "filing-identifier-1",
            dueDate: getCurrentDate().add(7, "month").format(defaultDateFormat),
          }),
          generateTaxFiling({
            identifier: "filing-identifier-1",
            dueDate: getCurrentDate().add(4, "month").format(defaultDateFormat),
          }),
          generateTaxFiling({
            identifier: "filing-identifier-1",
            dueDate: getCurrentDate().add(6, "month").format(defaultDateFormat),
          }),
        ],
      }),
    });

    const filing: Filing = generateFiling({
      id: "filing-identifier-1",
      agency: "Internal Revenue Service (IRS)",
    });

    renderFilingPage(filing);
    expect(screen.getByTestId("due-date")).toHaveTextContent(
      closestDate.format("MMMM D, YYYY").toUpperCase()
    );
  });

  it("contains a tooltip with a note regarding filing date in the annual report", async () => {
    useMockUserData({
      taxFilingData: generateTaxFilingData({
        filings: [generateTaxFiling({ identifier: "annual-report" })],
      }),
    });

    const filing: Filing = generateFiling({
      urlSlug: "annual-report",
    });

    renderFilingPage(filing);
    expect(screen.getByTestId("due-date-tooltip")).toBeInTheDocument();
    fireEvent.mouseOver(screen.getByTestId("due-date-tooltip"));
    await screen.findByText(Config.filingDefaults.dueDateToolTip);
  });
});

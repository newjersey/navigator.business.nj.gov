import { OperateReference } from "@/lib/types/types";
import { generateTaxFiling, generateTaxFilingData } from "@/test/factories";
import { markdownToText } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { getCurrentDate, parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { render, screen } from "@testing-library/react";
import { FilingsCalendar } from "./FilingsCalendar";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");

const setTabletScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

describe("<FilingsCalendar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRouter({});
    setTabletScreen(true);
  });

  it("displays filings calendar with annual report date", () => {
    const dueDate = getCurrentDate().add(2, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
    });
    useMockUserData({ taxFilingData: generateTaxFilingData({ filings: [annualReport] }) });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    render(
      <ThemeProvider theme={createTheme()}>
        <FilingsCalendar operateReferences={operateReferences} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("M/D"), { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Annual Report")).toBeInTheDocument();
  });

  it("displays empty calendar content when there are no filings", () => {
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    useMockUserData({ taxFilingData: generateTaxFilingData({ filings: [] }) });

    render(
      <ThemeProvider theme={createTheme()}>
        <FilingsCalendar operateReferences={operateReferences} />
      </ThemeProvider>
    );

    expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).toBeInTheDocument();
  });

  it("displays filings calendar as list with annual report date", () => {
    setTabletScreen(false);

    const dueDate = getCurrentDate().add(2, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
    });
    useMockUserData({ taxFilingData: generateTaxFilingData({ filings: [annualReport] }) });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    console.log(`Annual Report ${parseDateWithFormat(annualReport.dueDate, "YYYY-MM-DD").format("YYYY")}`);
    render(
      <ThemeProvider theme={createTheme()}>
        <FilingsCalendar operateReferences={operateReferences} />
      </ThemeProvider>
    );
    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(
        `Annual Report ${parseDateWithFormat(annualReport.dueDate, "YYYY-MM-DD").format("YYYY")}`
      )
    ).toBeInTheDocument();
  });
});

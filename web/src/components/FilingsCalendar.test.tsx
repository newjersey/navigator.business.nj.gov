import { OperateReference } from "@/lib/types/types";
import {
  generateOperateReference,
  generatePreferences,
  generateTaxFiling,
  generateTaxFilingData,
  generateUserData,
  randomLegalStructure,
} from "@/test/factories";
import { markdownToText, randomElementFromArray } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { OperatingPhases, randomInt, TaxFiling, UserData } from "@businessnjgovnavigator/shared/";
import { getCurrentDate, parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import { generateProfileData } from "../../test/factories";
import { FilingsCalendar } from "./FilingsCalendar";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const renderFilingsCalendar = (
  operateReferences: Record<string, OperateReference>,
  initialUserData?: UserData
) => {
  render(
    <ThemeProvider theme={createTheme()}>
      <WithStatefulUserData initialUserData={initialUserData}>
        <FilingsCalendar operateReferences={operateReferences} />
      </WithStatefulUserData>
    </ThemeProvider>
  );
};

const setTabletScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

describe("<FilingsCalendar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setTabletScreen(true);
    setupStatefulUserDataContext();
  });

  it("displays filings calendar with annual report date", () => {
    const dueDate = getCurrentDate().add(2, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
    });

    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
      preferences: generatePreferences({ isCalendarFullView: true }),
    });

    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    renderFilingsCalendar(operateReferences, userData);

    expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("M/D"), { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Annual Report")).toBeInTheDocument();
  });

  it("displays calendar content when there are filings in the next 11 months", () => {
    const dueDate = getCurrentDate().endOf("month").add(11, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
    });
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
      preferences: generatePreferences({ isCalendarFullView: true }),
    });

    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    renderFilingsCalendar(operateReferences, userData);

    expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).not.toBeInTheDocument();
  });

  it("displays empty calendar content when there are no filings in the next 11 months", () => {
    const dueDate = getCurrentDate().endOf("month").add(12, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
    });
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
    });

    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    renderFilingsCalendar(operateReferences, userData);

    expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).toBeInTheDocument();
  });

  it("displays empty calendar content when there are no filings", () => {
    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [] }),
      preferences: generatePreferences({ isCalendarFullView: true }),
    });

    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    renderFilingsCalendar(operateReferences, userData);

    expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).toBeInTheDocument();
  });

  it("displays filings calendar as list with annual report date", () => {
    const dueDate = getCurrentDate().add(2, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
    });

    const userData = generateUserData({
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
      preferences: generatePreferences({ isCalendarFullView: false }),
    });

    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    renderFilingsCalendar(operateReferences, userData);

    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(
        `Annual Report ${parseDateWithFormat(annualReport.dueDate, "YYYY-MM-DD").format("YYYY")}`
      )
    ).toBeInTheDocument();
  });

  describe("tax calendar access button", () => {
    beforeEach(() => {
      setTabletScreen(Boolean(randomInt() % 2));
    });

    it("displays button on filings calendar", () => {
      const dueDate = getCurrentDate().add(2, "months");
      const annualReport = generateTaxFiling({
        identifier: "annual-report",
        dueDate: dueDate.format("YYYY-MM-DD"),
      });

      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure(true).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => obj.displayTaxAccessButton === true)
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
      });

      const operateReferences: Record<string, OperateReference> = {
        "annual-report": {
          name: "Annual Report",
          urlSlug: "annual-report-url",
          urlPath: "annual_report-url-path",
        },
      };

      renderFilingsCalendar(operateReferences, userData);

      expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    });

    it("hides button on filings calendar when sp/gp", () => {
      const whateverReport = generateTaxFiling({
        identifier: "whatever-report",
      });
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure(false).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => obj.displayTaxAccessButton === true)
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: [whateverReport] }),
      });

      const operateReferences: Record<string, OperateReference> = {
        "whatever-report": {
          name: "Whatever",
          urlSlug: "whatever-report-url",
          urlPath: "whatever_report-url-path",
        },
      };

      renderFilingsCalendar(operateReferences, userData);

      expect(screen.queryByTestId("get-tax-access")).not.toBeInTheDocument();
    });

    it("hides button on filings calendar when displayTaxAccessButton is false", () => {
      const dueDate = getCurrentDate().add(2, "months");
      const annualReport = generateTaxFiling({
        identifier: "annual-report",
        dueDate: dueDate.format("YYYY-MM-DD"),
      });

      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure(true).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => obj.displayTaxAccessButton !== true)
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
      });

      const operateReferences: Record<string, OperateReference> = {
        "annual-report": {
          name: "Annual Report",
          urlSlug: "annual-report-url",
          urlPath: "annual_report-url-path",
        },
      };

      renderFilingsCalendar(operateReferences, userData);

      expect(screen.queryByTestId("get-tax-access")).not.toBeInTheDocument();
    });
  });

  describe("filings calendar in mobile", () => {
    let dueDate: dayjs.Dayjs;
    let annualReport: TaxFiling;
    let userData: UserData;
    let operateReferences: Record<string, OperateReference>;

    beforeEach(() => {
      setTabletScreen(false);

      dueDate = getCurrentDate().add(2, "months");
      annualReport = generateTaxFiling({
        identifier: "annual-report",
        dueDate: dueDate.format("YYYY-MM-DD"),
      });

      userData = generateUserData({
        taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
        preferences: generatePreferences({ isCalendarFullView: true }),
      });

      operateReferences = {
        "annual-report": generateOperateReference({}),
      };
    });

    it("displays filings calendar as list in mobile", () => {
      renderFilingsCalendar(operateReferences, userData);

      expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
      expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
    });

    it("does not display grid view button in mobile", () => {
      renderFilingsCalendar(operateReferences, userData);

      expect(
        screen.queryByText(Config.dashboardDefaults.calendarGridViewButton, { exact: false })
      ).not.toBeInTheDocument();
    });
  });

  describe("calendar list and grid views", () => {
    let dueDate: dayjs.Dayjs;
    let annualReport: TaxFiling;
    let userData: UserData;
    let operateReferences: Record<string, OperateReference>;

    beforeEach(() => {
      dueDate = getCurrentDate().add(2, "months");
      annualReport = generateTaxFiling({
        identifier: "annual-report",
        dueDate: dueDate.format("YYYY-MM-DD"),
      });

      userData = generateUserData({
        taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
        preferences: generatePreferences({ isCalendarFullView: true }),
      });

      operateReferences = {
        "annual-report": generateOperateReference({}),
      };
    });

    it("displays calendar list view when button is clicked", () => {
      renderFilingsCalendar(operateReferences, userData);

      expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewButton, { exact: false }));
      expect(currentUserData().preferences.isCalendarFullView).toBeFalsy();
      expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
      expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    });

    it("displays calendar grid view when button is clicked", () => {
      renderFilingsCalendar(operateReferences, userData);

      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewButton, { exact: false }));
      expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
      expect(currentUserData().preferences.isCalendarFullView).toBeFalsy();
      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarGridViewButton, { exact: false }));
      expect(currentUserData().preferences.isCalendarFullView).toBeTruthy();
      expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
      expect(screen.queryByTestId("filings-calendar-as-list")).not.toBeInTheDocument();
    });
  });
});

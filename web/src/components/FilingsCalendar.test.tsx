import { FilingsCalendar } from "@/components/FilingsCalendar";
import { getMergedConfig } from "@/contexts/configContext";
import { OperateReference } from "@/lib/types/types";
import {
  generateOperateReference,
  generatePreferences,
  generateProfileData,
  generateTaxFiling,
  generateTaxFilingData,
  generateUserData,
  randomLegalStructure,
} from "@/test/factories";
import { markdownToText, randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  defaultDateFormat,
  getCurrentDate,
  getJanOfCurrentYear,
  OperatingPhases,
  parseDateWithFormat,
  randomInt,
  TaxFiling,
  UserData,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import dayjs from "dayjs";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => {
  return mockMaterialUI();
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});

const Config = getMergedConfig();

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
  (useMediaQuery as jest.Mock).mockImplementation(() => {
    return value;
  });
};

describe("<FilingsCalendar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setTabletScreen(true);
    setupStatefulUserDataContext();
  });

  it("displays filings calendar with annual report date", () => {
    const dueDate = getJanOfCurrentYear().add(2, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });

    const userData = generateUserData({
      profileData: generateProfileData({
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "FULL";
          })
        ).id,
      }),
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

  it("displays filings only within a year in list view", () => {
    const farDueDate = getCurrentDate().add(2, "years");
    const farReport = generateTaxFiling({
      identifier: "whatever",
      dueDate: farDueDate.format(defaultDateFormat),
    });
    const recentDueDate = getCurrentDate().add(2, "months");

    const recentReport = generateTaxFiling({
      identifier: "whatever2",
      dueDate: recentDueDate.format(defaultDateFormat),
    });

    const userData = generateUserData({
      profileData: generateProfileData({
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "LIST";
          })
        ).id,
      }),
      taxFilingData: generateTaxFilingData({ filings: [farReport, recentReport] }),
      preferences: generatePreferences({ isCalendarFullView: false }),
    });

    const operateReferences: Record<string, OperateReference> = {
      whatever: {
        name: "Whatever Report",
        urlSlug: "whatever-url",
        urlPath: "whatever-url-path",
      },
      whatever2: {
        name: "Whatever2 Report",
        urlSlug: "whatever2-url",
        urlPath: "whatever2-url-path",
      },
    };

    renderFilingsCalendar(operateReferences, userData);
    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.queryByText(farDueDate.format("MMMM D, YYYY"), { exact: false })).not.toBeInTheDocument();
    expect(screen.getByText(recentDueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
  });

  it("displays calendar content when there are filings inside of the year", () => {
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: getCurrentDate().add(2, "months").format(defaultDateFormat),
    });

    const userData = generateUserData({
      profileData: generateProfileData({
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "FULL" && obj.displayCalendarToggleButton;
          })
        ).id,
      }),
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
    expect(
      screen.getByText(Config.dashboardDefaults.calendarListViewButton, { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).not.toBeInTheDocument();
  });

  it("displays empty calendar image without body text when there are no filings inside of the year", () => {
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: getCurrentDate().add(2, "years").format(defaultDateFormat),
    });

    const userData = generateUserData({
      profileData: generateProfileData({
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "FULL";
          })
        ).id,
      }),
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

    expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.dashboardDefaults.calendarListViewButton, { exact: false })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.dashboardDefaults.emptyCalendarBodyText))
    ).not.toBeInTheDocument();
  });

  it("displays empty calendar content when there are no filings", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "FULL";
          })
        ).id,
      }),
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
      screen.queryByText(Config.dashboardDefaults.calendarListViewButton, { exact: false })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.dashboardDefaults.emptyCalendarBodyText))
    ).toBeInTheDocument();
  });

  it("displays filings calendar as list with annual report date", () => {
    const dueDate = getCurrentDate().add(2, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });

    const userData = generateUserData({
      profileData: generateProfileData({
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "LIST";
          })
        ).id,
      }),
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
        `Annual Report ${parseDateWithFormat(annualReport.dueDate, defaultDateFormat).format("YYYY")}`
      )
    ).toBeInTheDocument();
  });

  describe("tax calendar access button", () => {
    beforeEach(() => {
      setTabletScreen(Boolean(randomInt() % 2));
    });

    it("displays button on filings calendar for PublicFiling", () => {
      const dueDate = getCurrentDate().add(2, "months");
      const annualReport = generateTaxFiling({
        identifier: "annual-report",
        dueDate: dueDate.format(defaultDateFormat),
      });

      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayTaxAccessButton === true && obj.displayCalendarType != "NONE";
            })
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

    it("displays button on filings calendar for TradeName", () => {
      const whateverReport = generateTaxFiling({
        identifier: "whatever-report",
      });
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: false }).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayTaxAccessButton === true && obj.displayCalendarType != "NONE";
            })
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

      expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    });

    it("hides button on filings calendar when displayTaxAccessButton is false", () => {
      const dueDate = getCurrentDate().add(2, "months");
      const annualReport = generateTaxFiling({
        identifier: "annual-report",
        dueDate: dueDate.format(defaultDateFormat),
      });

      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayTaxAccessButton !== true && obj.displayCalendarType != "NONE";
            })
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

    it("displays button on filings calendar in up and running guest mode for PublicFiling", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
          operatingPhase: "GUEST_MODE_OWNING",
        }),
      });
      renderFilingsCalendar({}, userData);
      expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    });

    it("display buttons on filings calendar in up and running guest mode for TradeName", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: false }).id,
          operatingPhase: "GUEST_MODE_OWNING",
        }),
        taxFilingData: generateTaxFilingData({ filings: [generateTaxFiling({})] }),
      });
      renderFilingsCalendar({}, userData);
      expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
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
        dueDate: dueDate.format(defaultDateFormat),
      });

      userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayCalendarType === "FULL";
            })
          ).id,
        }),
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
        dueDate: dueDate.format(defaultDateFormat),
      });

      userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayCalendarType === "FULL" && obj.displayCalendarToggleButton;
            })
          ).id,
        }),
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

    it("displays the calendar toggle button in operating phases that need it", () => {
      userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayCalendarToggleButton === true;
            })
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
        preferences: generatePreferences({ isCalendarFullView: false }),
      });

      renderFilingsCalendar(operateReferences, userData);
      expect(screen.getByText(Config.dashboardDefaults.calendarGridViewButton)).toBeInTheDocument();
    });

    it("doesnt't display the toggle button for operating phases that don't need it", () => {
      userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayCalendarToggleButton === false;
            })
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
        preferences: generatePreferences({ isCalendarFullView: false }),
      });

      renderFilingsCalendar(operateReferences, userData);
      expect(screen.queryByText(Config.dashboardDefaults.calendarGridViewButton)).not.toBeInTheDocument();
    });
  });
});

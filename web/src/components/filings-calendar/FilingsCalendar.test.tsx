import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { getMergedConfig } from "@/contexts/configContext";
import { OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  generateOperateReference,
  publicFilingLegalStructures,
  tradeNameLegalStructures,
} from "@/test/factories";
import { markdownToText, randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockProfileData } from "@/test/mock/mockUseUserData";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  LookupIndustryById,
  OperatingPhases,
  TaxFilingCalendarEvent,
  defaultDateFormat,
  generateBusiness,
  generateTaxFilingCalendarEvent,
  generateUserDataForBusiness,
  randomInt,
} from "@businessnjgovnavigator/shared";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import * as getCurrentDateModule from "@businessnjgovnavigator/shared/dateHelpers";
import {
  generateLicenseData,
  generatePreferences,
  generateProfileData,
  generateTaxFilingData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, within } from "@testing-library/react";
import dayjs, { Dayjs } from "dayjs";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      share_calendar_feedback: {
        click: {
          open_live_chat: jest.fn(),
        },
      },
    },
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@businessnjgovnavigator/shared/dateHelpers", () => {
  return {
    ...jest.requireActual("@businessnjgovnavigator/shared/dateHelpers"),
    getCurrentDate: jest.fn(),
  };
});
const currentDateMock = (getCurrentDateModule as jest.Mocked<typeof getCurrentDateModule>).getCurrentDate;

const getAprilDateOfThisYear = (): Dayjs => {
  return dayjs().month(3);
};
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const Config = getMergedConfig();

const renderFilingsCalendar = (
  operateReferences: Record<string, OperateReference>,
  business: Business
): void => {
  render(
    <ThemeProvider theme={createTheme()}>
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
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
    currentDateMock.mockReturnValue(getAprilDateOfThisYear());
  });

  it("displays filings calendar with annual report date", () => {
    const dueDate = getAprilDateOfThisYear().startOf("month");
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });

    const business = generateBusiness({
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

    renderFilingsCalendar(operateReferences, business);

    expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("M/D"), { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Annual Report")).toBeInTheDocument();
  });

  it("displays filings only within a year in list view", () => {
    const farDueDate = getAprilDateOfThisYear().add(2, "years");
    const farReport = generateTaxFilingCalendarEvent({
      identifier: "whatever",
      dueDate: farDueDate.format(defaultDateFormat),
    });
    const recentDueDate = getAprilDateOfThisYear().add(2, "months");

    const recentReport = generateTaxFilingCalendarEvent({
      identifier: "whatever2",
      dueDate: recentDueDate.format(defaultDateFormat),
    });

    const business = generateBusiness({
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

    renderFilingsCalendar(operateReferences, business);
    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.queryByText(farDueDate.format("MMMM D, YYYY"), { exact: false })).not.toBeInTheDocument();
    expect(screen.getByText(recentDueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
  });

  it("displays filings nested within a date in list view", () => {
    const recentDueDate = getAprilDateOfThisYear().add(2, "months");

    const farReport = generateTaxFilingCalendarEvent({
      identifier: "whatever",
      dueDate: recentDueDate.format(defaultDateFormat),
    });

    const recentReport = generateTaxFilingCalendarEvent({
      identifier: "whatever2",
      dueDate: recentDueDate.format(defaultDateFormat),
    });

    const business = generateBusiness({
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

    renderFilingsCalendar(operateReferences, business);
    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    const dateElement = within(
      // eslint-disable-next-line testing-library/no-node-access
      screen.getByText(recentDueDate.format("MMMM D, YYYY"), { exact: false }).parentElement as HTMLElement
    );
    expect(dateElement.getByText(operateReferences["whatever"].name, { exact: false })).toBeInTheDocument();
    expect(dateElement.getByText(operateReferences["whatever2"].name, { exact: false })).toBeInTheDocument();
  });

  it("displays calendar content when there are filings inside of the year", () => {
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: getAprilDateOfThisYear().add(2, "months").format(defaultDateFormat),
    });

    const business = generateBusiness({
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

    renderFilingsCalendar(operateReferences, business);
    expect(
      screen.getByText(Config.dashboardDefaults.calendarListViewButton, { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).not.toBeInTheDocument();
  });

  it("displays calendar content when there are filings in two years", () => {
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: getAprilDateOfThisYear().add(2, "years").format(defaultDateFormat),
    });

    const business = generateBusiness({
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

    renderFilingsCalendar(operateReferences, business);
    expect(
      screen.getByText(Config.dashboardDefaults.calendarListViewButton, { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("primary-year-selector-dropdown-button"));
    fireEvent.click(screen.getByText(getAprilDateOfThisYear().add(2, "years").year().toString()));
    expect(screen.getByText(`Annual Report`)).toBeInTheDocument();
  });

  it("displays empty calendar content when there are filings in two years", () => {
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: getAprilDateOfThisYear().add(2, "years").format(defaultDateFormat),
    });

    const business = generateBusiness({
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

    renderFilingsCalendar(operateReferences, business);
    expect(screen.getByTestId("filings-calendar")).toHaveTextContent(
      markdownToText(Config.dashboardDefaults.calendarEmptyDescriptionMarkdown)
    );
    fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewButton, { exact: false }));
    expect(screen.getByTestId("filings-calendar")).toHaveTextContent(
      markdownToText(Config.dashboardDefaults.calendarEmptyDescriptionMarkdown)
    );
    fireEvent.click(screen.getByTestId("primary-year-selector-dropdown-button"));
    fireEvent.click(screen.getByText(getAprilDateOfThisYear().add(2, "years").year().toString()));
    expect(screen.getByTestId("filings-calendar")).not.toHaveTextContent(
      markdownToText(Config.dashboardDefaults.calendarEmptyDescriptionMarkdown)
    );
    fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarGridViewButton, { exact: false }));
    expect(screen.getByTestId("filings-calendar")).not.toHaveTextContent(
      markdownToText(Config.dashboardDefaults.calendarEmptyDescriptionMarkdown)
    );
  });

  it("hides year selector when there are no taxFilings", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "FULL" && obj.displayCalendarToggleButton;
          })
        ).id,
      }),
      taxFilingData: generateTaxFilingData({ filings: [] }),
      preferences: generatePreferences({ isCalendarFullView: true }),
    });

    renderFilingsCalendar({}, business);
    expect(screen.queryByTestId("primary-year-selector-dropdown-button")).not.toBeInTheDocument();
  });

  it("displays empty calendar content when there are no filings", () => {
    const business = generateBusiness({
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

    renderFilingsCalendar(operateReferences, business);

    expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.dashboardDefaults.calendarListViewButton, { exact: false })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.dashboardDefaults.emptyCalendarTitleText))
    ).toBeInTheDocument();
  });

  describe("formation date prompt", () => {
    it.each(publicFilingLegalStructures)(
      "shows formation date prompt if %s and not yet entered Formation Date",
      (legalStructureId) => {
        const business = generateBusiness({
          profileData: generateProfileData({ dateOfFormation: undefined, legalStructureId }),
          taxFilingData: generateTaxFilingData({ filings: [] }),
        });
        renderFilingsCalendar({}, business);
        expect(screen.getByTestId("formation-date-prompt")).toBeInTheDocument();
      }
    );

    it.each(publicFilingLegalStructures)(
      "shows formation date prompt if %s and not yet entered Formation Date even if other filings exist",
      (legalStructureId) => {
        const business = generateBusiness({
          profileData: generateProfileData({ dateOfFormation: undefined, legalStructureId }),
          taxFilingData: generateTaxFilingData({
            filings: [generateTaxFilingCalendarEvent({ identifier: "filing1" })],
          }),
        });
        const operateReferences: Record<string, OperateReference> = {
          filing1: generateOperateReference({}),
        };
        useMockProfileData({ dateOfFormation: undefined, legalStructureId });
        renderFilingsCalendar(operateReferences, business);
        expect(screen.getByTestId("formation-date-prompt")).toBeInTheDocument();
      }
    );

    it.each(publicFilingLegalStructures)(
      "does not show formation date prompt if %s and has entered Formation Date",
      (legalStructureId) => {
        const business = generateBusiness({
          profileData: generateProfileData({ dateOfFormation: "2023-01-01", legalStructureId }),
          taxFilingData: generateTaxFilingData({ filings: [] }),
        });
        renderFilingsCalendar({}, business);
        expect(screen.queryByTestId("formation-date-prompt")).not.toBeInTheDocument();
      }
    );

    it.each(tradeNameLegalStructures)("does not show formation date prompt if %s", (legalStructureId) => {
      const business = generateBusiness({
        profileData: generateProfileData({ legalStructureId }),
        taxFilingData: generateTaxFilingData({ filings: [] }),
      });
      renderFilingsCalendar({}, business);
      expect(screen.queryByTestId("formation-date-prompt")).not.toBeInTheDocument();
    });
  });

  it("displays filings calendar as list with annual report", () => {
    const dueDate = getAprilDateOfThisYear().add(2, "months");
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });

    const business = generateBusiness({
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

    renderFilingsCalendar(operateReferences, business);

    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Annual Report")).toBeInTheDocument();
  });

  it("displays filings calendar as list with license events", () => {
    const expirationDate = getAprilDateOfThisYear().add(2, "months");

    const business = generateBusiness({
      profileData: generateProfileData({
        industryId: "home-contractor",
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "LIST";
          })
        ).id,
      }),
      licenseData: generateLicenseData({ expirationISO: expirationDate.toISOString() }),
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFilingCalendarEvent({
            identifier: "annual-report",
            dueDate: getAprilDateOfThisYear().add(1, "months").format(defaultDateFormat),
          }),
        ],
      }),
      preferences: generatePreferences({ isCalendarFullView: false }),
    });

    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };

    renderFilingsCalendar(operateReferences, business);

    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.getByText(expirationDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    const expectedName = `${LookupIndustryById("home-contractor").licenseType} ${
      Config.licenseEventDefaults.expirationTitleLabel
    }`;
    expect(screen.getByText(expectedName)).toBeInTheDocument();
  });

  it("sends analytics when feedback modal link is clicked", () => {
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: getAprilDateOfThisYear().format(defaultDateFormat),
    });

    const business = generateBusiness({
      profileData: generateProfileData({
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayCalendarType === "FULL";
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
    renderFilingsCalendar(operateReferences, business);
    fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarFeedbackButtonText));
    expect(mockAnalytics.event.share_calendar_feedback.click.open_live_chat).toHaveBeenCalled();
  });

  describe("tax calendar access button", () => {
    beforeEach(() => {
      setTabletScreen(Boolean(randomInt() % 2));
    });

    it("displays button on filings calendar for PublicFiling", () => {
      const dueDate = getAprilDateOfThisYear().add(2, "months");
      const annualReport = generateTaxFilingCalendarEvent({
        identifier: "annual-report",
        dueDate: dueDate.format(defaultDateFormat),
      });

      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayTaxAccessButton === true && obj.displayCalendarType !== "NONE";
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

      renderFilingsCalendar(operateReferences, business);

      expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    });

    it("displays button on filings calendar for TradeName", () => {
      const whateverReport = generateTaxFilingCalendarEvent({
        identifier: "whatever-report",
      });
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: false }).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayTaxAccessButton === true && obj.displayCalendarType !== "NONE";
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

      renderFilingsCalendar(operateReferences, business);

      expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    });

    it("hides button on filings calendar when displayTaxAccessButton is false", () => {
      const dueDate = getAprilDateOfThisYear().add(2, "months");
      const annualReport = generateTaxFilingCalendarEvent({
        identifier: "annual-report",
        dueDate: dueDate.format(defaultDateFormat),
      });

      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayTaxAccessButton !== true && obj.displayCalendarType !== "NONE";
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

      renderFilingsCalendar(operateReferences, business);

      expect(screen.queryByTestId("get-tax-access")).not.toBeInTheDocument();
    });

    it("displays button on filings calendar in up and running guest mode for PublicFiling", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
          operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
        }),
      });
      renderFilingsCalendar({}, business);
      expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    });

    it("display buttons on filings calendar in up and running guest mode for TradeName", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: randomLegalStructure({ requiresPublicFiling: false }).id,
          operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
        }),
        taxFilingData: generateTaxFilingData({ filings: [generateTaxFilingCalendarEvent({})] }),
      });
      renderFilingsCalendar({}, business);
      expect(screen.getByTestId("get-tax-access")).toBeInTheDocument();
    });
  });

  describe("filings calendar in mobile", () => {
    let dueDate: dayjs.Dayjs;
    let annualReport: TaxFilingCalendarEvent;
    let business: Business;
    let operateReferences: Record<string, OperateReference>;

    beforeEach(() => {
      setTabletScreen(false);

      dueDate = getAprilDateOfThisYear().add(2, "months");
      annualReport = generateTaxFilingCalendarEvent({
        identifier: "annual-report",
        dueDate: dueDate.format(defaultDateFormat),
      });

      business = generateBusiness({
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
      renderFilingsCalendar(operateReferences, business);

      expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
      expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
    });

    it("does not display grid view button in mobile", () => {
      renderFilingsCalendar(operateReferences, business);

      expect(
        screen.queryByText(Config.dashboardDefaults.calendarGridViewButton, { exact: false })
      ).not.toBeInTheDocument();
    });

    it("doesn't display past months in list view", () => {
      const pastDueDate = getAprilDateOfThisYear().subtract(1, "months");
      const pastReport = generateTaxFilingCalendarEvent({
        identifier: "past",
        dueDate: pastDueDate.format(defaultDateFormat),
      });

      const futureDueDate = getAprilDateOfThisYear().add(2, "months");
      const futureReport = generateTaxFilingCalendarEvent({
        identifier: "future",
        dueDate: futureDueDate.format(defaultDateFormat),
      });

      const business = generateBusiness({
        profileData: generateProfileData({
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayCalendarType === "LIST" || obj.displayCalendarType === "FULL";
            })
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: [pastReport, futureReport] }),
      });

      const operateReferences: Record<string, OperateReference> = {
        past: generateOperateReference({}),
        future: generateOperateReference({}),
      };

      renderFilingsCalendar(operateReferences, business);

      expect(
        screen.queryByText(pastDueDate.format("MMMM D, YYYY"), { exact: false })
      ).not.toBeInTheDocument();
      expect(screen.getByText(futureDueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    });
  });

  describe("calendar list and grid views", () => {
    let dueDate: dayjs.Dayjs;
    let annualReport: TaxFilingCalendarEvent;
    let business: Business;
    let operateReferences: Record<string, OperateReference>;

    beforeEach(() => {
      dueDate = getAprilDateOfThisYear().add(2, "months");
      annualReport = generateTaxFilingCalendarEvent({
        identifier: "annual-report",
        dueDate: dueDate.format(defaultDateFormat),
      });

      business = generateBusiness({
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
      renderFilingsCalendar(operateReferences, business);

      expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewButton, { exact: false }));
      expect(currentBusiness().preferences.isCalendarFullView).toBeFalsy();
      expect(screen.queryByTestId("filings-calendar-as-table")).not.toBeInTheDocument();
      expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    });

    it("displays calendar grid view when button is clicked", () => {
      renderFilingsCalendar(operateReferences, business);

      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewButton, { exact: false }));
      expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
      expect(currentBusiness().preferences.isCalendarFullView).toBeFalsy();
      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarGridViewButton, { exact: false }));
      expect(currentBusiness().preferences.isCalendarFullView).toBeTruthy();
      expect(screen.getByTestId("filings-calendar-as-table")).toBeInTheDocument();
      expect(screen.queryByTestId("filings-calendar-as-list")).not.toBeInTheDocument();
    });

    it("displays the calendar toggle button in operating phases that need it", () => {
      business = generateBusiness({
        profileData: generateProfileData({
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => obj.displayCalendarToggleButton)
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
        preferences: generatePreferences({ isCalendarFullView: false }),
      });

      renderFilingsCalendar(operateReferences, business);
      expect(screen.getByText(Config.dashboardDefaults.calendarGridViewButton)).toBeInTheDocument();
    });

    it("doesnt't display the toggle button for operating phases that don't need it", () => {
      business = generateBusiness({
        profileData: generateProfileData({
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => !obj.displayCalendarToggleButton)
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
        preferences: generatePreferences({ isCalendarFullView: false }),
      });

      renderFilingsCalendar(operateReferences, business);
      expect(screen.queryByText(Config.dashboardDefaults.calendarGridViewButton)).not.toBeInTheDocument();
    });
  });

  describe("calendar list view, view more functionality", () => {
    const renderCalendarWithEntries = (numberOfCalendarEntries: number): void => {
      let dueDate: dayjs.Dayjs;
      let annualReport: TaxFilingCalendarEvent;
      const operateReferences: Record<string, OperateReference> = {};
      const filings: TaxFilingCalendarEvent[] = [];
      [
        getAprilDateOfThisYear(),
        getAprilDateOfThisYear().add(1, "years"),
        getAprilDateOfThisYear().add(2, "years"),
      ].map((dates) => {
        for (let i = 0; i < numberOfCalendarEntries; i++) {
          dueDate = dates.add(2, "months").add(i, "day");
          annualReport = generateTaxFilingCalendarEvent({
            identifier: `annual-report-${i}`,
            dueDate: dueDate.format(defaultDateFormat),
          });
          filings.push(annualReport);
          operateReferences[`annual-report-${i}`] = generateOperateReference({});
        }
      });

      const business = generateBusiness({
        profileData: generateProfileData({
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayCalendarType === "FULL" && obj.displayCalendarToggleButton;
            })
          ).id,
        }),
        taxFilingData: generateTaxFilingData({ filings: filings }),
        preferences: generatePreferences({ isCalendarFullView: false }),
      });

      renderFilingsCalendar(operateReferences, business);
    };

    it("does not show the view more button if 5 or fewer events are in the calendar", () => {
      renderCalendarWithEntries(5);
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(5);
      expect(screen.queryByText(Config.dashboardDefaults.calendarListViewMoreButton)).not.toBeInTheDocument();
    });

    it("shows the view more button if more than 5 events are in the calendar", () => {
      renderCalendarWithEntries(6);
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(5);
      expect(screen.getByText(Config.dashboardDefaults.calendarListViewMoreButton)).toBeInTheDocument();
    });

    it("shows 5 more events when the view more button is clicked", () => {
      renderCalendarWithEntries(12);
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(5);
      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewMoreButton));
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(10);
      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewMoreButton));
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(12);
    });

    it("does not shows the view more button when we have no more entries to show", () => {
      renderCalendarWithEntries(6);
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(5);
      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewMoreButton));
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(6);
      expect(screen.queryByText(Config.dashboardDefaults.calendarListViewMoreButton)).not.toBeInTheDocument();
    });

    it("resets view more button when year is changed", () => {
      renderCalendarWithEntries(12);

      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(5);
      fireEvent.click(screen.getByText(Config.dashboardDefaults.calendarListViewMoreButton));
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(10);
      fireEvent.click(screen.getByTestId("primary-year-selector-dropdown-button"));
      fireEvent.click(screen.getByText(getAprilDateOfThisYear().add(2, "years").year().toString()));
      expect(screen.getAllByTestId("calendar-list-entry")).toHaveLength(5);
    });
  });
});

import { SignUpSnackbar } from "@/components/auth/SignUpSnackbar";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { Certification, Funding, OperateReference, SidebarCardContent } from "@/lib/types/types";
import DashboardPage from "@/pages/dashboard";
import {
  generateBusinessPersona,
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
  generateStep,
  generateTask,
  generateTaxFiling,
  generateTaxFilingData,
  generateUserData,
  randomHomeBasedIndustry,
  randomNonHomeBasedIndustry,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setMockUserDataResponse, useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  defaultDateFormat,
  getCurrentDate,
  OperatingPhases,
  parseDateWithFormat,
  RegistrationStatus,
  UserData,
} from "@businessnjgovnavigator/shared";
import { OperatingPhase } from "@businessnjgovnavigator/shared/src/operatingPhase";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

const Config = getMergedConfig();

const setDesktopScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => {
    return value;
  });
};

const createDisplayContent = (sidebar?: Record<string, SidebarCardContent>) => {
  return {
    contentMd: "",
    sidebarDisplayContent: sidebar ?? {
      welcome: generateSidebarCardContent({}),
    },
  };
};

describe("dashboard page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
    useMockRouter({});
    setDesktopScreen(true);
    jest.useFakeTimers();
  });

  const renderDashboardPage = ({
    sidebarDisplayContent,
    operateReferences,
  }: {
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
    operateReferences?: Record<string, OperateReference>;
  }) => {
    render(
      <ThemeProvider theme={createTheme()}>
        <DashboardPage
          operateReferences={operateReferences ?? {}}
          displayContent={createDisplayContent(sidebarDisplayContent)}
          fundings={[]}
          certifications={[]}
          municipalities={[]}
        />
      </ThemeProvider>
    );
  };

  const renderStatefulPage = (userData?: UserData) => {
    setupStatefulUserDataContext();

    render(
      <WithStatefulUserData initialUserData={userData || generateUserData({})}>
        <ThemeProvider theme={createTheme()}>
          <DashboardPage
            operateReferences={{}}
            displayContent={createDisplayContent()}
            fundings={[]}
            certifications={[]}
            municipalities={[]}
          />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  const renderPageWithAuthAlert = ({
    userData,
    isAuthenticated,
    sidebarDisplayContent,
    fundings,
    certifications,
    registrationAlertIsVisible,
    registrationAlertStatus,
    setRegistrationAlertIsVisible,
  }: {
    userData?: UserData;
    isAuthenticated?: IsAuthenticated;
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
    fundings?: Funding[];
    certifications?: Certification[];
    registrationAlertIsVisible?: boolean;
    registrationAlertStatus?: RegistrationStatus;
    setRegistrationAlertIsVisible?: jest.Mock<() => void>;
  }) => {
    setupStatefulUserDataContext();

    render(
      withAuthAlert(
        <WithStatefulUserData initialUserData={userData || generateUserData({})}>
          <ThemeProvider theme={createTheme()}>
            <SignUpSnackbar />
            <DashboardPage
              operateReferences={{}}
              displayContent={createDisplayContent(sidebarDisplayContent)}
              fundings={fundings ?? []}
              certifications={certifications ?? []}
              municipalities={[]}
            />
          </ThemeProvider>
        </WithStatefulUserData>,
        isAuthenticated ?? IsAuthenticated.TRUE,
        {
          registrationAlertIsVisible: registrationAlertIsVisible ?? false,
          registrationAlertStatus,
          setRegistrationAlertIsVisible,
        }
      )
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    setMockUserDataResponse({ userData: undefined });
    renderDashboardPage({});
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("shows loading page if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderDashboardPage({});
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("redirects to onboarding if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderDashboardPage({});
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  it("shows snackbar alert when success query is true", () => {
    useMockProfileData({});
    useMockRouter({ isReady: true, query: { success: "true" } });
    renderDashboardPage({});
    expect(screen.getByText(Config.profileDefaults.successTextHeader)).toBeInTheDocument();
  });

  it("shows steps and tasks from roadmap", () => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          timeEstimate: "1-2 weeks",
          stepNumber: 1,
        }),
        generateStep({
          name: "step2",
          stepNumber: 2,
        }),
      ],
      tasks: [
        generateTask({ name: "task1", stepNumber: 1 }),
        generateTask({ name: "task2", stepNumber: 1 }),
        generateTask({ name: "task3", stepNumber: 2 }),
      ],
    });

    renderDashboardPage({});

    expect(screen.getByText("step1", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("(1-2 weeks)")).toBeInTheDocument();
    expect(screen.getByText("task1")).toBeInTheDocument();
    expect(screen.getByText("task2")).toBeInTheDocument();

    expect(screen.getByText("step2", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("task3")).toBeInTheDocument();
  });

  it("shows task progress tag", () => {
    useMockRoadmap({
      steps: [generateStep({ name: "step1", stepNumber: 1 }), generateStep({ name: "step2", stepNumber: 2 })],
      tasks: [
        generateTask({ id: "task1", name: "task1", stepNumber: 1 }),
        generateTask({ id: "task2", name: "task2", stepNumber: 1 }),
        generateTask({ id: "task3", name: "task3", stepNumber: 2 }),
      ],
    });

    useMockUserData({
      taskProgress: { task1: "IN_PROGRESS", task2: "COMPLETED" },
    });

    renderDashboardPage({});

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Not started")).toBeInTheDocument();
  });

  it("displays each step under associated section", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
        generateStep({ name: "step3", section: "PLAN" }),
        generateStep({ name: "step4", section: "START" }),
      ],
    });

    renderDashboardPage({});

    const sectionPlan = screen.getByTestId("section-plan");

    expect(within(sectionPlan).getByText("step1")).toBeInTheDocument();
    expect(within(sectionPlan).getByText("step3")).toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step2")).not.toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step4")).not.toBeInTheDocument();

    const sectionStart = screen.getByTestId("section-start");

    expect(within(sectionStart).queryByText("step1")).not.toBeInTheDocument();
    expect(within(sectionStart).queryByText("step3")).not.toBeInTheDocument();
    expect(within(sectionStart).getByText("step2")).toBeInTheDocument();
    expect(within(sectionStart).getByText("step4")).toBeInTheDocument();
  });

  it("displays sections based on userData preferences", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
      ],
    });

    useMockUserData({
      preferences: generatePreferences({
        roadmapOpenSections: ["PLAN", "START"],
      }),
      taxFilingData: generateTaxFilingData({}),
    });

    renderDashboardPage({});

    const sectionStart = screen.getByTestId("section-start");
    const sectionPlan = screen.getByTestId("section-plan");

    expect(within(sectionStart).getByText("step2")).toBeVisible();
    expect(within(sectionPlan).getByText("step1")).toBeVisible();
  });

  it("renders registration card when routing is not from onboarding and authentication is false,", async () => {
    setDesktopScreen(true);
    const setRegistrationAlertIsVisible = jest.fn();
    useMockRouter({ query: { fromOnboarding: "false" } });

    const sidebarDisplayContent = {
      "not-registered": generateSidebarCardContent({ contentMd: "NotRegisteredContent" }),
      welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
    };
    renderPageWithAuthAlert({
      registrationAlertIsVisible: true,
      sidebarDisplayContent,
      isAuthenticated: IsAuthenticated.FALSE,
      setRegistrationAlertIsVisible,
    });

    expect(screen.getByText("NotRegisteredContent")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
    });
    expect(setRegistrationAlertIsVisible).toHaveBeenCalledWith(false);
  });

  it("renders calendar snackbar when fromFormBusinessEntity query parameter is provided", () => {
    useMockRouter({ isReady: true, query: { fromFormBusinessEntity: "true" } });
    renderDashboardPage({});
    expect(screen.getByTestId("snackbar-alert-calendar")).toBeInTheDocument();
  });

  it("renders certification snackbar when fromTaxRegistration query parameter is provided", () => {
    useMockRouter({ isReady: true, query: { fromTaxRegistration: "true" } });
    renderDashboardPage({});
    expect(screen.getByTestId("certification-alert")).toBeInTheDocument();
  });

  it("renders funding snackbar when fromFunding query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { fromFunding: "true" } });

    renderDashboardPage({});
    expect(screen.getByTestId("funding-alert")).toBeInTheDocument();
  });

  it("renders hiddenTasks snackbar after delay when fromFunding query parameter is provided", async () => {
    jest.useFakeTimers();
    useMockRouter({ isReady: true, query: { fromFunding: "true" } });

    renderDashboardPage({});
    await act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(screen.getByTestId("hiddenTasks-alert")).toBeInTheDocument();
  });

  it("renders deferred question snackbar when deferredQuestionAnswered query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { deferredQuestionAnswered: "true" } });

    renderDashboardPage({});
    expect(screen.getByTestId("deferredQuestionAnswered-alert")).toBeInTheDocument();
  });

  it("displays filings calendar as list when taxfiling is populated and operatingPhase has ListCalendar", () => {
    const dueDate = getCurrentDate().add(1, "days");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });
    useMockUserData({
      profileData: generateProfileData({ operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES" }),
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
    });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    renderDashboardPage({ operateReferences });

    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(
        `Annual Report ${parseDateWithFormat(annualReport.dueDate, defaultDateFormat).format("YYYY")}`
      )
    ).toBeInTheDocument();
  });

  it("does not display filings calendar as list when taxfiling is not populated", () => {
    const currentDate = getCurrentDate();
    const dateOfFormation = currentDate.format(defaultDateFormat);

    useMockUserData({
      profileData: generateProfileData({ dateOfFormation: dateOfFormation }),
      taxFilingData: generateTaxFilingData({ filings: [] }),
    });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    renderDashboardPage({ operateReferences });

    expect(screen.queryByTestId("filings-calendar-as-list")).not.toBeInTheDocument();
  });

  it("does not display filings calendar as list when formation data is not populated", () => {
    const dueDate = getCurrentDate().add(12, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });
    useMockUserData({
      profileData: generateProfileData({ dateOfFormation: undefined }),
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
    });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    renderDashboardPage({ operateReferences });

    expect(screen.queryByTestId("filings-calendar-as-list")).not.toBeInTheDocument();
  });

  it("does not render HideableTasks for operating phases that don't display HideableRoadmapTasks", () => {
    const randomOperatingPhase = randomElementFromArray(
      (OperatingPhases as OperatingPhase[]).filter((obj) => {
        return !obj.displayHideableRoadmapTasks;
      })
    );

    useMockUserData({ profileData: generateProfileData({ operatingPhase: randomOperatingPhase.id }) });
    renderDashboardPage({});

    expect(screen.queryByText(Config.dashboardDefaults.upAndRunningTaskHeader)).not.toBeInTheDocument();
  });

  it("renders HideableTasks for operating phases that display HideableRoadmapTasks", () => {
    const randomOperatingPhase = randomElementFromArray(
      (OperatingPhases as OperatingPhase[]).filter((obj) => {
        return obj.displayHideableRoadmapTasks;
      })
    );

    useMockUserData({ profileData: generateProfileData({ operatingPhase: randomOperatingPhase.id }) });
    renderDashboardPage({});

    expect(screen.getByText(Config.dashboardDefaults.upAndRunningTaskHeader)).toBeInTheDocument();
  });

  it("renders tabs in mobile view", () => {
    setDesktopScreen(false);
    renderDashboardPage({});

    expect(screen.queryByTestId("rightSidebarPageLayout")).not.toBeInTheDocument();
    expect(screen.getByTestId("two-tab-Layout")).toBeInTheDocument();
  });

  it("does not render tabs in desktop view", () => {
    setDesktopScreen(true);
    renderDashboardPage({});

    expect(screen.getByTestId("rightSidebarPageLayout")).toBeInTheDocument();
    expect(screen.queryByTestId("two-tab-Layout")).not.toBeInTheDocument();
  });

  describe("deferred onboarding question", () => {
    it("shows home-based business question with default description when applicable to industry and not yet answered", () => {
      const defaultDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
        return phase.displayAltHomeBasedBusinessDescription === false;
      });

      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: randomHomeBasedIndustry(),
          homeBasedBusiness: undefined,
          businessPersona: generateBusinessPersona(),
          operatingPhase: randomElementFromArray(defaultDescOperatingPhases as OperatingPhase[]).id,
        }),
      });
      useMockUserData(userData);

      renderDashboardPage({});
      expect(
        screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
      ).not.toBeInTheDocument();
    });

    it("does not show home-based business question when already answered", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: randomHomeBasedIndustry(),
          homeBasedBusiness: false,
        }),
      });
      useMockUserData(userData);
      renderDashboardPage({});
      expect(
        screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
      ).not.toBeInTheDocument();
    });

    it("does not show home-based business question when not applicable to industry", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: randomNonHomeBasedIndustry(),
          homeBasedBusiness: undefined,
        }),
      });
      useMockUserData(userData);
      renderDashboardPage({});
      expect(
        screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
      ).not.toBeInTheDocument();
    });

    it("shows home-based business question with alt description when applicable to industry and not yet answered", () => {
      const altDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
        return phase.displayAltHomeBasedBusinessDescription === true;
      });
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: randomHomeBasedIndustry(),
          homeBasedBusiness: undefined,
          businessPersona: generateBusinessPersona(),
          operatingPhase: randomElementFromArray(altDescOperatingPhases as OperatingPhase[]).id,
        }),
      });
      useMockUserData(userData);

      renderDashboardPage({});
      expect(
        screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
      ).toBeInTheDocument();
    });

    it("sets homeBasedBusiness in profile and removes question when radio is selected", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: randomHomeBasedIndustry(),
          homeBasedBusiness: undefined,
        }),
      });
      useMockUserData(userData);
      renderStatefulPage(userData);
      chooseHomeBasedValue("true");
      fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));

      await waitFor(() => {
        return expect(
          screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
        ).not.toBeInTheDocument();
      });
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
    });

    it("shallow routes with query parameter when radio is selected", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: randomHomeBasedIndustry(),
          homeBasedBusiness: undefined,
        }),
      });
      useMockUserData(userData);
      renderStatefulPage(userData);
      chooseHomeBasedValue("false");
      fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));
      await waitFor(() => {
        return expect(mockPush).toHaveBeenCalledWith(
          { query: { deferredQuestionAnswered: "true" } },
          undefined,
          {
            shallow: true,
          }
        );
      });
    });

    const chooseHomeBasedValue = (value: "true" | "false") => {
      fireEvent.click(screen.getByTestId(`home-based-business-radio-${value}`));
    };
  });

  describe("phase newly changed indicator", () => {
    it("immediately sets phaseNewlyChanged to false when in desktop mode", async () => {
      setDesktopScreen(true);
      renderStatefulPage(generateUserData({ preferences: generatePreferences({ phaseNewlyChanged: true }) }));
      await waitFor(() => {
        return expect(currentUserData().preferences.phaseNewlyChanged).toBe(false);
      });
    });

    it("does not update userData when phaseNewlyChanged is false in desktop mode", async () => {
      setDesktopScreen(true);
      renderStatefulPage(
        generateUserData({ preferences: generatePreferences({ phaseNewlyChanged: false }) })
      );
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("sets phaseNewlyChanged to false on mobile when visiting For You tab", async () => {
      setDesktopScreen(false);
      renderStatefulPage(generateUserData({ preferences: generatePreferences({ phaseNewlyChanged: true }) }));

      expect(userDataWasNotUpdated()).toBe(true);

      fireEvent.click(screen.getByTestId("for-you-tab"));
      expect(screen.getByText(Config.dashboardDefaults.sidebarHeading)).toBeInTheDocument();
      await waitFor(() => {
        return expect(currentUserData().preferences.phaseNewlyChanged).toBe(false);
      });
    });

    it("shows indicator next to For You tab when phaseNewlyChanged is true on mobile", async () => {
      setDesktopScreen(false);
      renderStatefulPage(generateUserData({ preferences: generatePreferences({ phaseNewlyChanged: true }) }));

      expect(screen.getByTestId("for-you-indicator")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("for-you-tab"));
      await waitFor(() => {
        return expect(screen.queryByTestId("for-you-indicator")).not.toBeInTheDocument();
      });
    });

    it("shows no indicator on desktop", () => {
      setDesktopScreen(true);
      renderStatefulPage(generateUserData({ preferences: generatePreferences({ phaseNewlyChanged: true }) }));
      expect(screen.queryByTestId("for-you-indicator")).not.toBeInTheDocument();
    });
  });
});

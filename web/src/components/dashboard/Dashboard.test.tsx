import { Dashboard } from "@/components/dashboard/Dashboard";
import {
  generateAnytimeActionTask,
  generateSidebarCardContent,
  generateStep,
  generateTask,
  generateXrayRenewalCalendarEvent,
} from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  defaultDateFormat,
  generateBusiness,
  generatePreferences,
  generateProfileData,
  generateTaxFilingCalendarEvent,
  generateTaxFilingData,
  generateUserDataForBusiness,
  getCurrentDate,
  getIndustries,
  OperatingPhases,
  randomElementFromArray,
} from "@businessnjgovnavigator/shared";
import { OperatingPhase, OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  LicenseEventType,
  OperateReference,
  RoadmapDisplayContent,
  SidebarCardContent,
} from "@businessnjgovnavigator/shared/types";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

const Config = getMergedConfig();

const createDisplayContent = (
  sidebar?: Record<string, SidebarCardContent>,
): RoadmapDisplayContent => {
  return {
    sidebarDisplayContent: sidebar ?? {
      welcome: generateSidebarCardContent({}),
    },
  };
};

const operatingPhasesThatDontDisplayHideableRoadmapTasks = OperatingPhases.filter((obj) => {
  return !obj.displayHideableRoadmapTasks;
}).map((obj) => obj.id);

const operatingPhasesThatDisplayHideableRoadmapTasks = OperatingPhases.filter(
  (obj) => obj.displayHideableRoadmapTasks,
).map((obj) => obj.id);

describe("<DashboardOnDesktop />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({ onboardingFormProgress: "COMPLETED" });
    useMockRoadmap({});
    useMockRouter({});
    setLargeScreen(true);
    jest.useFakeTimers();
  });

  const renderDashboardComponent = ({
    sidebarDisplayContent,
    operateReferences,
    anytimeActionTasks,
    anytimeActionLicenseReinstatements,
    licenseEvents,
  }: {
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
    operateReferences?: Record<string, OperateReference>;
    anytimeActionTasks?: AnytimeActionTask[];
    anytimeActionLicenseReinstatements?: AnytimeActionLicenseReinstatement[];
    licenseEvents?: LicenseEventType[];
  }): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <Dashboard
          operateReferences={operateReferences ?? {}}
          displayContent={createDisplayContent(sidebarDisplayContent)}
          fundings={[]}
          certifications={[]}
          anytimeActionTasks={anytimeActionTasks ?? []}
          anytimeActionLicenseReinstatements={anytimeActionLicenseReinstatements ?? []}
          licenseEvents={licenseEvents ?? []}
          xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
        />
      </ThemeProvider>,
    );
  };

  const renderStatefulDashboardComponent = ({ business }: { business?: Business }): void => {
    setupStatefulUserDataContext();

    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}
      >
        <ThemeProvider theme={createTheme()}>
          <Dashboard
            operateReferences={{}}
            displayContent={createDisplayContent()}
            fundings={[]}
            certifications={[]}
            anytimeActionTasks={[]}
            anytimeActionLicenseReinstatements={[]}
            licenseEvents={[]}
            xrayRenewalEvent={generateXrayRenewalCalendarEvent({})}
          />
        </ThemeProvider>
      </WithStatefulUserData>,
    );
  };

  describe("personalize my tasks button", () => {
    it.each([
      {
        label: "STARTING",
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: undefined,
        }),
      },
      {
        label: "NEXUS",
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          legalStructureId: undefined,
        }),
      },
    ])("hidden for a $label business with undefined business structure", ({ profileData }) => {
      const business = generateBusiness({ profileData });
      renderStatefulDashboardComponent({ business });

      expect(
        screen.queryByText(Config.dashboardHeaderDefaults.personalizeMyTasksButtonText),
      ).not.toBeInTheDocument();
    });

    it.each([
      {
        label: "STARTING",
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "sole-proprietorship",
        }),
      },
      {
        label: "NEXUS",
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          legalStructureId: "sole-proprietorship",
        }),
      },
    ])("shows for a $label business with defined business structure", ({ profileData }) => {
      const business = generateBusiness({ profileData });
      renderStatefulDashboardComponent({ business });

      expect(
        screen.getByText(Config.dashboardHeaderDefaults.personalizeMyTasksButtonText),
      ).toBeInTheDocument();
    });

    it.each([
      {
        label: "OWNING",
        profileData: generateProfileData({
          businessPersona: "OWNING",
        }),
      },
      {
        label: "REMOTE",
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["revenueInNJ"],
        }),
      },
      {
        label: "DOMESTIC-EMPLOYER",
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "domestic-employer",
        }),
      },
    ])("shows for a $label business", ({ profileData }) => {
      const business = generateBusiness({ profileData });
      renderStatefulDashboardComponent({ business });

      expect(
        screen.getByText(Config.dashboardHeaderDefaults.personalizeMyTasksButtonText),
      ).toBeInTheDocument();
    });
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

    renderDashboardComponent({});

    expect(screen.getByText("step1", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("(1-2 weeks)")).toBeInTheDocument();
    expect(screen.getByText("task1")).toBeInTheDocument();
    expect(screen.getByText("task2")).toBeInTheDocument();

    expect(screen.getByText("step2", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("task3")).toBeInTheDocument();
  });

  it("shows task progress tag", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", stepNumber: 1 }),
        generateStep({ name: "step2", stepNumber: 2 }),
      ],
      tasks: [
        generateTask({ id: "task1", name: "task1", stepNumber: 1 }),
        generateTask({ id: "task2", name: "task2", stepNumber: 1 }),
      ],
    });

    useMockBusiness({
      taskProgress: { task1: "TO_DO", task2: "COMPLETED" },
      onboardingFormProgress: "COMPLETED",
    });

    renderDashboardComponent({});

    expect(screen.getByText("To do")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
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

    renderDashboardComponent({});

    const sectionPlan = screen.getByTestId("section-plan");
    const sectionStart = screen.getByTestId("section-start");

    expect(within(sectionPlan).getByText("step1")).toBeInTheDocument();
    expect(within(sectionPlan).getByText("step3")).toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step2")).not.toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step4")).not.toBeInTheDocument();

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

    useMockBusiness({
      preferences: generatePreferences({
        roadmapOpenSections: ["PLAN", "START"],
      }),
      taxFilingData: generateTaxFilingData({}),
      onboardingFormProgress: "COMPLETED",
    });

    renderDashboardComponent({});

    const sectionPlan = screen.getByTestId("section-plan");
    const sectionStart = screen.getByTestId("section-start");

    expect(within(sectionStart).getByText("step2")).toBeVisible();
    expect(within(sectionPlan).getByText("step1")).toBeVisible();
  });

  it.each(operatingPhasesThatDontDisplayHideableRoadmapTasks)(
    "does not render HideableTasks for %s that don't display HideableRoadmapTasks",
    (OperatingPhase) => {
      useMockBusiness({ profileData: generateProfileData({ operatingPhase: OperatingPhase }) });
      renderDashboardComponent({});

      expect(screen.queryByTestId("hideableTasks")).not.toBeInTheDocument();
    },
  );

  describe("anytime actions", () => {
    const operatingPhasesWithAnytimeActions = OperatingPhases.filter((phase: OperatingPhase) => {
      return phase.displayAnytimeActions;
    }).map((phase) => phase.id);

    const operatingPhasesWithoutAnytimeActions = OperatingPhases.filter((phase: OperatingPhase) => {
      return !phase.displayAnytimeActions;
    }).map((phase) => phase.id);

    it.each(operatingPhasesWithoutAnytimeActions)(
      "does not display anytime action section for %s",
      (phase) => {
        useMockBusiness(
          generateBusiness({ profileData: generateProfileData({ operatingPhase: phase }) }),
        );
        renderDashboardComponent({
          anytimeActionTasks: [generateAnytimeActionTask({})],
        });

        expect(screen.queryByTestId("anytimeActionSearch")).not.toBeInTheDocument();
      },
    );

    it.each(operatingPhasesWithAnytimeActions)(
      "displays anytime action section for %s",
      (phase) => {
        useMockBusiness(
          generateBusiness({ profileData: generateProfileData({ operatingPhase: phase }) }),
        );
        renderDashboardComponent({
          anytimeActionTasks: [generateAnytimeActionTask({})],
        });

        expect(screen.getByTestId("anytimeActionSearch")).toBeInTheDocument();
      },
    );
  });

  it("displays step2 for guest mode user when business structure task is completed", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
      ],
    });

    useMockBusiness({
      profileData: generateProfileData({
        operatingPhase: OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE,
      }),
      onboardingFormProgress: "COMPLETED",
    });

    renderDashboardComponent({});

    expect(within(screen.getByTestId("section-start")).getByText("step2")).toBeVisible();
  });

  it("displays filings calendar as list when taxfiling is populated and operatingPhase has ListCalendar", () => {
    const dueDate = getCurrentDate().add(1, "days");
    const annualReport = generateTaxFilingCalendarEvent({
      identifier: "annual-report",
      dueDate: dueDate.format(defaultDateFormat),
    });
    useMockBusiness({
      profileData: generateProfileData({ operatingPhase: OperatingPhaseId.FORMED }),
      taxFilingData: generateTaxFilingData({ filings: [annualReport] }),
      onboardingFormProgress: "COMPLETED",
    });
    const operateReferences: Record<string, OperateReference> = {
      "annual-report": {
        name: "Annual Report",
        urlSlug: "annual-report-url",
        urlPath: "annual_report-url-path",
      },
    };
    renderDashboardComponent({ operateReferences });

    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Annual Report")).toBeInTheDocument();
  });

  it.each(operatingPhasesThatDisplayHideableRoadmapTasks)(
    "renders HideableTasks for %s that display HideableRoadmapTasks",
    (OperatingPhase) => {
      const filteredIndustries = getIndustries().filter(
        (industry) => industry.id !== "domestic-employer",
      );
      useMockBusiness({
        profileData: generateProfileData({
          operatingPhase: OperatingPhase,
          industryId: randomElementFromArray(filteredIndustries).id,
        }),
        onboardingFormProgress: "COMPLETED",
      });
      renderDashboardComponent({});

      expect(
        screen.getByText(Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText),
      ).toBeInTheDocument();
      expect(
        screen.queryAllByRole("heading", {
          level: 2,
          name: Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText,
        }).length,
      ).toEqual(0);
    },
  );

  it("renders HideableTasks for domestic-employer industry with alternate heading", () => {
    useMockBusiness({
      profileData: generateProfileData({ industryId: "domestic-employer" }),
      onboardingFormProgress: "COMPLETED",
    });
    renderDashboardComponent({});

    expect(
      screen.queryByText(Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText,
      }),
    ).toBeInTheDocument();
  });

  it("does not render tabs in desktop view", () => {
    renderDashboardComponent({});
    expect(screen.getByTestId("rightSidebarPageLayout")).toBeInTheDocument();
    expect(screen.queryByTestId("two-tab-Layout")).not.toBeInTheDocument();
  });

  describe("mobile view specifics", () => {
    beforeEach(() => {
      setLargeScreen(false);
    });

    it("renders tabs", () => {
      renderDashboardComponent({});

      expect(screen.queryByTestId("rightSidebarPageLayout")).not.toBeInTheDocument();
      expect(screen.getByTestId("two-tab-Layout")).toBeInTheDocument();
    });

    it("sets phaseNewlyChanged to false on mobile when rendering For You tab", async () => {
      const business = generateBusiness({
        preferences: generatePreferences({ phaseNewlyChanged: true }),
        onboardingFormProgress: "COMPLETED",
      });
      renderStatefulDashboardComponent({ business });

      expect(userDataWasNotUpdated()).toBe(true);

      fireEvent.click(screen.getByTestId("for-you-tab"));
      await waitFor(() => {
        return expect(currentBusiness().preferences.phaseNewlyChanged).toBe(false);
      });
    });

    it("shows indicator next to For You tab when phaseNewlyChanged is true", async () => {
      const business = generateBusiness({
        preferences: generatePreferences({ phaseNewlyChanged: true }),
        onboardingFormProgress: "COMPLETED",
      });
      renderStatefulDashboardComponent({ business });

      expect(screen.getByTestId("for-you-indicator")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("for-you-tab"));
      await waitFor(() => {
        return expect(screen.queryByTestId("for-you-indicator")).not.toBeInTheDocument();
      });
    });
  });
});

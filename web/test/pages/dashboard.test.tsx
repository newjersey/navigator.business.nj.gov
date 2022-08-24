import { SignUpSnackbar } from "@/components/auth/SignUpSnackbar";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { Certification, Funding, OperateReference, SidebarCardContent } from "@/lib/types/types";
import DashboardPage from "@/pages/dashboard";
import {
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
  generateStep,
  generateTask,
  generateTaxFiling,
  generateTaxFilingData,
  generateUserData,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setMockUserDataResponse, useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  getCurrentDate,
  parseDateWithFormat,
  RegistrationStatus,
  UserData,
} from "@businessnjgovnavigator/shared/";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { act, render, screen, waitFor, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

const setMobileScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

const createDisplayContent = (sidebar?: Record<string, SidebarCardContent>) => ({
  contentMd: "",
  sidebarDisplayContent: sidebar ?? {
    welcome: generateSidebarCardContent({}),
  },
});

describe("roadmap page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
    useMockRouter({});
    setMobileScreen(false);
    jest.useFakeTimers();
  });

  const renderRoadmapPage = ({
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
        />
      </ThemeProvider>
    );
  };

  const renderPageWithAuthAlert = ({
    userData,
    isAuthenticated,
    sidebarDisplayContent,
    fundings,
    certifications,
    alertIsVisible,
    registrationAlertStatus,
    setAlertIsVisible,
  }: {
    userData?: UserData;
    isAuthenticated?: IsAuthenticated;
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
    fundings?: Funding[];
    certifications?: Certification[];
    alertIsVisible?: boolean;
    registrationAlertStatus?: RegistrationStatus;
    setAlertIsVisible?: jest.Mock<() => void>;
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
            />
          </ThemeProvider>
        </WithStatefulUserData>,
        isAuthenticated ?? IsAuthenticated.TRUE,
        { alertIsVisible: alertIsVisible ?? false, registrationAlertStatus, setAlertIsVisible }
      )
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    setMockUserDataResponse({ userData: undefined });
    renderRoadmapPage({});
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("shows loading page if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderRoadmapPage({});
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("redirects to onboarding if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderRoadmapPage({});
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  it("shows snackbar alert when success query is true", () => {
    useMockProfileData({});
    useMockRouter({ isReady: true, query: { success: "true" } });
    renderRoadmapPage({});
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

    renderRoadmapPage({});

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

    renderRoadmapPage({});

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

    renderRoadmapPage({});

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

    renderRoadmapPage({});

    const sectionStart = screen.getByTestId("section-start");
    const sectionPlan = screen.getByTestId("section-plan");

    expect(within(sectionStart).getByText("step2")).toBeVisible();
    expect(within(sectionPlan).getByText("step1")).toBeVisible();
  });

  it("renders registration card when routing is not from onboarding and authentication is false,", async () => {
    const setAlertIsVisible = jest.fn();
    useMockRouter({ query: { fromOnboarding: "false" } });

    const sidebarDisplayContent = {
      "not-registered": generateSidebarCardContent({ contentMd: "NotRegisteredContent" }),
      welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
    };
    renderPageWithAuthAlert({
      alertIsVisible: true,
      sidebarDisplayContent,
      isAuthenticated: IsAuthenticated.FALSE,
      setAlertIsVisible,
    });

    expect(screen.getByText("NotRegisteredContent")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
    });
    expect(setAlertIsVisible).toHaveBeenCalledWith(false);
  });

  it("renders calendar snackbar when fromFormBusinessEntity query parameter is provided", () => {
    useMockRouter({ isReady: true, query: { fromFormBusinessEntity: "true" } });
    renderRoadmapPage({});
    expect(screen.getByTestId("snackbar-alert-calendar")).toBeInTheDocument();
  });

  it("renders certification snackbar when fromTaxRegistration query parameter is provided", () => {
    useMockRouter({ isReady: true, query: { fromTaxRegistration: "true" } });
    renderRoadmapPage({});
    expect(screen.getByTestId("toast-alert-certification")).toBeInTheDocument();
  });

  it("renders funding snackbar when fromFunding query parameter is provided", async () => {
    useMockRouter({ isReady: true, query: { fromFunding: "true" } });

    renderRoadmapPage({});
    expect(screen.getByTestId("funding-alert")).toBeInTheDocument();
  });

  it("renders hiddenTasks snackbar after delay when fromFunding query parameter is provided", async () => {
    jest.useFakeTimers();
    useMockRouter({ isReady: true, query: { fromFunding: "true" } });

    renderRoadmapPage({});
    await act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(screen.getByTestId("hiddenTasks-alert")).toBeInTheDocument();
  });

  it("displays filings calendar as list when taxfiling is populated and operatingPhase has displayListCalendar", () => {
    const dueDate = getCurrentDate().add(12, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
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
    renderRoadmapPage({ operateReferences });

    expect(screen.getByTestId("filings-calendar-as-list")).toBeInTheDocument();
    expect(screen.getByText(dueDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText(
        `Annual Report ${parseDateWithFormat(annualReport.dueDate, "YYYY-MM-DD").format("YYYY")}`
      )
    ).toBeInTheDocument();
  });

  it("does not display filings calendar as list when taxfiling is not populated", () => {
    const currentDate = getCurrentDate();
    const dateOfFormation = currentDate.format("YYYY-MM-DD");

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
    renderRoadmapPage({ operateReferences });

    expect(screen.queryByTestId("filings-calendar-as-list")).not.toBeInTheDocument();
  });

  it("does not display filings calendar as list when formation data is not populated", () => {
    const dueDate = getCurrentDate().add(12, "months");
    const annualReport = generateTaxFiling({
      identifier: "annual-report",
      dueDate: dueDate.format("YYYY-MM-DD"),
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
    renderRoadmapPage({ operateReferences });

    expect(screen.queryByTestId("filings-calendar-as-list")).not.toBeInTheDocument();
  });
});

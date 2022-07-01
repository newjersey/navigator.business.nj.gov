import { SignUpToast } from "@/components/auth/SignUpToast";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { SidebarCardContent } from "@/lib/types/types";
import RoadmapPage from "@/pages/roadmap";
import {
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
  generateStep,
  generateTask,
  generateTaxFilingData,
  generateUserData,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setMockUserDataResponse, useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { RegistrationStatus, UserData } from "@businessnjgovnavigator/shared/";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

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
    graduation: generateSidebarCardContent({}),
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
  }: {
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
  }) => {
    render(
      <ThemeProvider theme={createTheme()}>
        <RoadmapPage operateReferences={{}} displayContent={createDisplayContent(sidebarDisplayContent)} />
      </ThemeProvider>
    );
  };

  const renderStatefulRoadmapPage = ({
    userData,
    sidebarDisplayContent,
  }: {
    userData?: UserData;
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
  }) => {
    setupStatefulUserDataContext();

    render(
      <WithStatefulUserData initialUserData={userData || generateUserData({})}>
        <ThemeProvider theme={createTheme()}>
          <RoadmapPage operateReferences={{}} displayContent={createDisplayContent(sidebarDisplayContent)} />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  const renderPageWithAuthAlert = ({
    userData,
    isAuthenticated,
    sidebarDisplayContent,
    alertIsVisible,
    registrationAlertStatus,
    setAlertIsVisible,
  }: {
    userData?: UserData;
    isAuthenticated?: IsAuthenticated;
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
    alertIsVisible?: boolean;
    registrationAlertStatus?: RegistrationStatus;
    setAlertIsVisible?: jest.Mock<() => void>;
  }) => {
    setupStatefulUserDataContext();

    render(
      withAuthAlert(
        <WithStatefulUserData initialUserData={userData || generateUserData({})}>
          <ThemeProvider theme={createTheme()}>
            <SignUpToast />
            <RoadmapPage
              operateReferences={{}}
              displayContent={createDisplayContent(sidebarDisplayContent)}
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
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });

  it("shows toast alert when success query is true", () => {
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
          tasks: [generateTask({ name: "task1" }), generateTask({ name: "task2" })],
        }),
        generateStep({
          name: "step2",
          tasks: [generateTask({ name: "task3" })],
        }),
      ],
    });

    renderRoadmapPage({});

    expect(screen.getByText("step1", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("1-2 weeks")).toBeInTheDocument();
    expect(screen.getByText("task1")).toBeInTheDocument();
    expect(screen.getByText("task2")).toBeInTheDocument();

    expect(screen.getByText("step2", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("task3")).toBeInTheDocument();
  });

  it("shows task progress tag", () => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          timeEstimate: "1-2 weeks",
          tasks: [generateTask({ id: "task1", name: "task1" }), generateTask({ id: "task2", name: "task2" })],
        }),
        generateStep({
          name: "step2",
          tasks: [generateTask({ id: "task3", name: "task3" })],
        }),
      ],
    });

    useMockUserData({
      taskProgress: {
        task1: "IN_PROGRESS",
        task2: "COMPLETED",
      },
    });

    renderRoadmapPage({});

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Not started")).toBeInTheDocument();
  });

  it("displays each step under associated section", () => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          section: "PLAN",
        }),
        generateStep({
          name: "step2",
          section: "START",
        }),
        generateStep({
          name: "step3",
          section: "PLAN",
        }),
        generateStep({
          name: "step4",
          section: "START",
        }),
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

  describe("sidebar", () => {
    it("renders welcome card", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["welcome"],
        }),
      });

      const sidebarDisplayContent = {
        welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
      };

      renderPageWithAuthAlert({ userData, sidebarDisplayContent });
      await waitFor(() => {
        expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
      });
    });

    it("renders registration card when SignUpToast is closed", async () => {
      useMockRouter({ query: { fromOnboarding: "true" } });

      const sidebarDisplayContent = {
        "not-registered": generateSidebarCardContent({ contentMd: "NotRegisteredContent" }),
        welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
        graduation: generateSidebarCardContent({ contentMd: "graduation" }),
      };
      renderPageWithAuthAlert({
        alertIsVisible: true,
        sidebarDisplayContent,
        isAuthenticated: IsAuthenticated.FALSE,
      });

      expect(screen.queryByText("NotRegisteredContent")).not.toBeInTheDocument();
      expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();

      fireEvent.click(within(screen.queryByTestId("self-reg-toast") as HTMLElement).getByLabelText("close"));

      await waitFor(() => {
        expect(screen.getByText("NotRegisteredContent")).toBeInTheDocument();
      });
      expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
    });

    it("renders registration card when SignUpToast is removed", async () => {
      const setAlertIsVisible = jest.fn();
      useMockRouter({});

      const sidebarDisplayContent = {
        "not-registered": generateSidebarCardContent({ contentMd: "NotRegisteredContent" }),
        welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
        graduation: generateSidebarCardContent({ contentMd: "graduation" }),
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

    it("removes successful registration card when it's closed", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["successful-registration"],
        }),
      });

      const sidebarDisplayContent = {
        "successful-registration": generateSidebarCardContent({
          id: "successful-registration",
          contentMd: "SuccessContent",
          hasCloseButton: true,
        }),
      };

      renderPageWithAuthAlert({
        userData,
        sidebarDisplayContent,
      });

      await waitFor(() => {
        expect(screen.getByText("SuccessContent")).toBeInTheDocument();
      });

      fireEvent.click(
        within(screen.getByTestId("successful-registration") as HTMLElement).getByLabelText("Close")
      );

      await waitFor(() => {
        expect(screen.queryByText("SuccessContent")).not.toBeInTheDocument();
      });
    });

    it("renders graduation card", () => {
      useMockUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["graduation"],
        }),
      });

      const sidebarDisplayContent = {
        graduation: generateSidebarCardContent({ contentMd: "graduationCard" }),
      };
      renderRoadmapPage({ sidebarDisplayContent });

      expect(screen.getByText("graduationCard")).toBeInTheDocument();
    });

    it("hides graduation card when business persona is FOREIGN", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["graduation"],
        }),
        profileData: generateProfileData({ businessPersona: "FOREIGN" }),
      });
      const sidebarDisplayContent = {
        graduation: generateSidebarCardContent({ contentMd: "graduationCard" }),
      };

      renderStatefulRoadmapPage({
        userData,
        sidebarDisplayContent,
      });

      await waitFor(() => {
        expect(screen.queryByText("graduationCard")).not.toBeInTheDocument();
      });
    });
  });
});

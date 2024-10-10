import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { RoadmapDisplayContent, SidebarCardContent } from "@/lib/types/types";
import DashboardPage from "@/pages/dashboard";
import { generateSidebarCardContent } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setMockUserDataResponse, useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { generateOwningProfileData, OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import {
  generateBusiness,
  generatePreferences,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const setDesktopScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => {
    return value;
  });
};
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

const createDisplayContent = (sidebar?: Record<string, SidebarCardContent>): RoadmapDisplayContent => {
  return {
    sidebarDisplayContent: sidebar ?? {
      welcome: generateSidebarCardContent({}),
    },
  };
};

describe("dashboard page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({ onboardingFormProgress: "COMPLETED" });
    useMockRoadmap({});
    useMockRouter({});
    jest.useFakeTimers();
  });

  const renderDashboardPage = (): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <DashboardPage
          operateReferences={{}}
          displayContent={createDisplayContent()}
          fundings={[]}
          certifications={[]}
          municipalities={[]}
          anytimeActionLinks={[]}
          anytimeActionTasks={[]}
          anytimeActionLicenseReinstatements={[]}
          licenseEvents={[]}
        />
      </ThemeProvider>
    );
  };

  const renderStatefulDashboardComponent = (business: Business): void => {
    setupStatefulUserDataContext();

    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business ?? generateBusiness({}))}>
        <ThemeProvider theme={createTheme()}>
          <DashboardPage
            operateReferences={{}}
            displayContent={createDisplayContent()}
            fundings={[]}
            certifications={[]}
            municipalities={[]}
            anytimeActionLinks={[]}
            anytimeActionTasks={[]}
            anytimeActionLicenseReinstatements={[]}
            licenseEvents={[]}
          />
        </ThemeProvider>
      </WithStatefulUserData>
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    setMockUserDataResponse({ userData: undefined });
    renderDashboardPage();
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("shows loading page if user not finished onboarding", () => {
    useMockBusiness({ onboardingFormProgress: "UNSTARTED" });
    renderDashboardPage();
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("redirects to onboarding if user not finished onboarding", () => {
    useMockBusiness({ onboardingFormProgress: "UNSTARTED" });
    renderDashboardPage();
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  it("renders the DashboardAlert element", () => {
    useMockRouter({ isReady: true, query: { [QUERIES.fromFormBusinessEntity]: "true" } });
    renderDashboardPage();
    expect(screen.getByTestId("dashboard-alerts")).toBeInTheDocument();
  });

  it("renders not-registered card when operatingPhase is GUEST_MODE and businessPersona is STARTING", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        operatingPhase: OperatingPhaseId.GUEST_MODE,
      }),
      preferences: generatePreferences({
        visibleSidebarCards: [],
      }),
    });
    renderStatefulDashboardComponent(business);
    expect(currentBusiness().preferences.visibleSidebarCards).toContain(SIDEBAR_CARDS.notRegistered);
  });

  it("renders not-registered card when operatingPhase is GUEST_MODE and businessPersona is FOREIGN", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "FOREIGN",
        operatingPhase: OperatingPhaseId.GUEST_MODE,
      }),
      preferences: generatePreferences({
        visibleSidebarCards: [],
      }),
    });
    renderStatefulDashboardComponent(business);

    expect(currentBusiness().preferences.visibleSidebarCards).toContain(SIDEBAR_CARDS.notRegistered);
  });

  it("renders not-registered-up-and-running card when operatingPhase is GUEST_MODE_OWNING and businessPersona is OWNING", () => {
    const business = generateBusiness({
      profileData: generateOwningProfileData({
        operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
      }),
      preferences: generatePreferences({
        visibleSidebarCards: [],
      }),
    });
    renderStatefulDashboardComponent(business);
    expect(currentBusiness().preferences.visibleSidebarCards).toContain(
      SIDEBAR_CARDS.notRegisteredUpAndRunning
    );
  });

  describe("phase newly changed indicator", () => {
    it("shows no indicator on desktop", () => {
      const business = generateBusiness({ preferences: generatePreferences({ phaseNewlyChanged: true }) });
      useMockBusiness(business);
      renderDashboardPage();
      expect(screen.queryByTestId("for-you-indicator")).not.toBeInTheDocument();
    });

    it("immediately sets phaseNewlyChanged to false when in desktop mode", async () => {
      setDesktopScreen(true);
      const business = generateBusiness({
        preferences: generatePreferences({ phaseNewlyChanged: true }),
        onboardingFormProgress: "COMPLETED",
      });

      renderStatefulDashboardComponent(business);
      await waitFor(() => {
        return expect(currentBusiness().preferences.phaseNewlyChanged).toBe(false);
      });
    });

    it("does not update userData when phaseNewlyChanged is false in desktop mode", async () => {
      const business = generateBusiness({ preferences: generatePreferences({ phaseNewlyChanged: false }) });
      useMockBusiness(business);
      renderDashboardPage();
      expect(userDataWasNotUpdated()).toBe(true);
    });
  });
});

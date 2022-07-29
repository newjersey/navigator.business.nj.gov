import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { SidebarCardContent } from "@/lib/types/types";
import {
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
  generateUserData,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/businessUser";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { SignUpSnackbar } from "../auth/SignUpSnackbar";
import { RoadmapSidebarList } from "./RoadmapSidebarList";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");

describe("<RoadmapSidebarCard />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
    useMockRouter({});
  });

  const renderPage = (sidebarDisplayContent: Record<string, SidebarCardContent>) => {
    render(<RoadmapSidebarList sidebarDisplayContent={sidebarDisplayContent} />);
  };

  const renderStatefulPage = (
    userData: UserData,
    sidebarDisplayContent: Record<string, SidebarCardContent>
  ) => {
    render(
      <WithStatefulUserData initialUserData={userData}>
        <RoadmapSidebarList sidebarDisplayContent={sidebarDisplayContent} />
      </WithStatefulUserData>
    );
  };

  const renderPageWithAuth = ({
    userData,
    isAuthenticated,
    sidebarDisplayContent,
    alertIsVisible,
    registrationAlertStatus,
    setAlertIsVisible,
  }: {
    userData: UserData;
    isAuthenticated?: IsAuthenticated;
    sidebarDisplayContent: Record<string, SidebarCardContent>;
    alertIsVisible?: boolean;
    registrationAlertStatus?: RegistrationStatus;
    setAlertIsVisible?: jest.Mock<() => void>;
  }) => {
    render(
      withAuthAlert(
        <WithStatefulUserData initialUserData={userData}>
          <SignUpSnackbar />
          <RoadmapSidebarList sidebarDisplayContent={sidebarDisplayContent} />
        </WithStatefulUserData>,
        isAuthenticated ?? IsAuthenticated.TRUE,
        { alertIsVisible: alertIsVisible ?? false, registrationAlertStatus, setAlertIsVisible }
      )
    );
  };

  it("shows graduation card when business persona is STARTING", () => {
    const graduationCard = {
      graduation: generateSidebarCardContent({
        id: "graduation",
      }),
    };

    const profileData = generateProfileData({ businessPersona: "STARTING" });
    const preferences = generatePreferences({ visibleRoadmapSidebarCards: ["graduation"] });

    useMockUserData({ profileData, preferences });

    renderPage(graduationCard);
    expect(screen.getByTestId("graduation")).toBeInTheDocument();
  });

  it("shows graduation card when business persona is OWNING", () => {
    const graduationCard = {
      graduation: generateSidebarCardContent({
        id: "graduation",
      }),
    };

    const profileData = generateProfileData({ businessPersona: "OWNING" });
    const preferences = generatePreferences({ visibleRoadmapSidebarCards: ["graduation"] });

    useMockUserData({ profileData, preferences });

    renderPage(graduationCard);
    expect(screen.getByTestId("graduation")).toBeInTheDocument();
  });

  it("does not show graduation card when business persona is FOREIGN", async () => {
    const graduationCard = {
      graduation: generateSidebarCardContent({
        id: "graduation",
      }),
    };

    const profileData = generateProfileData({ businessPersona: "FOREIGN" });
    const preferences = generatePreferences({ visibleRoadmapSidebarCards: ["graduation"] });

    const userData = generateUserData({ profileData, preferences });

    renderStatefulPage(userData, graduationCard);

    expect(screen.queryByTestId("graduation")).not.toBeInTheDocument();
  });

  it("shows graduation modal when graduation card cta button is clicked", () => {
    const graduationCard = {
      graduation: generateSidebarCardContent({
        id: "graduation",
      }),
    };

    const profileData = generateProfileData({ businessPersona: "OWNING" });
    const preferences = generatePreferences({ visibleRoadmapSidebarCards: ["graduation"] });

    useMockUserData({ profileData, preferences });

    renderPage(graduationCard);
    fireEvent.click(screen.getByTestId("cta-graduation"));

    expect(screen.getByTestId("graduation-modal")).toBeInTheDocument();
  });

  it("renders the welcome card", () => {
    const welcomeCard = {
      welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
    };

    useMockUserData({ preferences: generatePreferences({ visibleRoadmapSidebarCards: ["welcome"] }) });

    renderPage(welcomeCard);
    expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
  });

  it("renders registration card when SignUpSnackbar is closed", async () => {
    useMockRouter({ query: { fromOnboarding: "true" } });

    const sidebarDisplayContent = {
      "not-registered": generateSidebarCardContent({ contentMd: "NotRegisteredContent" }),
    };

    const userData = generateUserData({
      preferences: generatePreferences({ visibleRoadmapSidebarCards: [] }),
    });

    renderPageWithAuth({
      userData: userData,
      alertIsVisible: true,
      sidebarDisplayContent,
      isAuthenticated: IsAuthenticated.FALSE,
    });

    expect(screen.queryByText("NotRegisteredContent")).not.toBeInTheDocument();
    fireEvent.click(within(screen.queryByTestId("self-reg-snackbar") as HTMLElement).getByLabelText("close"));
    await waitFor(() => {
      expect(screen.getByText("NotRegisteredContent")).toBeInTheDocument();
    });
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

    renderPageWithAuth({
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
});

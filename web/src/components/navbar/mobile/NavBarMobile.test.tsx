import { NavBarMobile } from "@/components/navbar/mobile/NavBarMobile";
import { getMergedConfig } from "@/contexts/configContext";
import { generateRoadmap, generateStep, generateTask } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness, useMockUserData } from "@/test/mock/mockUseUserData";
import {
  Business,
  generateBusiness,
  generateProfileData,
  generateUserData,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import { ReactNode } from "react";

const Config = getMergedConfig();

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
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock(
  "next/link",
  () =>
    ({ children }: { children: ReactNode }): ReactNode =>
      children
);

const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

const businessName = "businessName";

const generateBusinessNamedBusiness = (overrides?: Partial<Business>): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      businessName: businessName,
      tradeName: "",
      industryId: "cannabis",
      legalStructureId: "limited-liability-company",
    }),
    ...overrides,
  });
};

describe("<NavBarMobile />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
    setLargeScreen(false);
    useMockBusiness(generateBusinessNamedBusiness());
  });

  describe("landing configuration", () => {
    it("shows quick link and account icons", () => {
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={false}
          isLanding={true}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
        />
      );

      expect(screen.getByTestId("nav-menu-mobile-account-open")).toBeInTheDocument();
      expect(screen.getByTestId("nav-menu-mobile-quick-link-open")).toBeInTheDocument();
    });

    it("renders getStarted and Login in account dropdown", () => {
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={false}
          isLanding={true}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
        />
      );

      expect(screen.queryByText(Config.navigationDefaults.getStartedText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.logInButton)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("nav-menu-mobile-account-open"));
      expect(screen.getByText(Config.navigationDefaults.getStartedText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
    });
  });

  describe("seo starter kit configuration", () => {
    it("shows my account text and login button", () => {
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={false}
          isLanding={false}
          isSeoStarterKit={true}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
        />
      );

      expect(screen.getByText(Config.navigationDefaults.navBarMyAccountText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
    });
  });

  describe("onboarding configuration", () => {
    it("shows account icon and not quick link icon", () => {
      render(
        <NavBarMobile
          currentlyOnboarding={true}
          isAuthenticated={false}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
        />
      );

      expect(screen.getByTestId("nav-menu-mobile-account-open")).toBeInTheDocument();
      expect(screen.queryByTestId("nav-menu-mobile-quick-link-open")).not.toBeInTheDocument();
    });

    it("renders login in account dropdown", () => {
      render(
        <NavBarMobile
          currentlyOnboarding={true}
          isAuthenticated={false}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
        />
      );

      expect(screen.queryByText(Config.navigationDefaults.logInButton)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("nav-menu-mobile-account-open"));
      expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
    });
  });

  describe("authenticated configuration", () => {
    it("shows quick link and account icons", () => {
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={true}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
        />
      );

      expect(screen.getByTestId("nav-menu-mobile-account-open")).toBeInTheDocument();
      expect(screen.getByTestId("nav-menu-mobile-quick-link-open")).toBeInTheDocument();
    });

    it("renders profile, add business, myNj and logout in account menu", () => {
      const userData = generateUserData({});
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={true}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
          userData={userData}
        />
      );
      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.addBusinessButton)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("nav-menu-mobile-account-open"));

      expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.addBusinessButton)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.myNJAccountText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.logoutButton)).toBeInTheDocument();
    });
  });

  describe("guest configuration", () => {
    it("shows quick link and account icons", () => {
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={false}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
        />
      );

      expect(screen.getByTestId("nav-menu-mobile-account-open")).toBeInTheDocument();
      expect(screen.getByTestId("nav-menu-mobile-quick-link-open")).toBeInTheDocument();
    });

    it("renders profile, register and login in the account menu", () => {
      const userData = generateUserData({});
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={false}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={false}
          previousBusinessId={undefined}
          userData={userData}
        />
      );
      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.logInButton)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("nav-menu-mobile-account-open"));

      expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
    });
  });

  describe("side bar and mini-roadmap", () => {
    it("does not display mini-roadmap when hideMiniRoadmap is true", () => {
      useMockBusiness({});
      useMockRoadmap(generateRoadmap({ steps: [generateStep({ name: "step1" })] }));
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={true}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={true}
          showSidebar={true}
          previousBusinessId={undefined}
        />
      );
      expect(screen.queryByText("step1")).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId("nav-menu-mobile-account-open"));
      expect(screen.queryByText("step1")).not.toBeInTheDocument();
    });

    it("displays mini-roadmap with PLAN/START when hideMiniRoadmap does not exist", () => {
      useMockBusiness({});
      useMockRoadmap(
        generateRoadmap({
          steps: [
            generateStep({ name: "step1", section: "PLAN" }),
            generateStep({ name: "step2", section: "START" }),
          ],
        })
      );
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={true}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={false}
          showSidebar={true}
          previousBusinessId={undefined}
        />
      );

      expect(screen.queryByText("step1")).not.toBeInTheDocument();
      expect(screen.queryByText(Config.sectionHeaders.PLAN)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.sectionHeaders.START)).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId("nav-menu-mobile-account-open"));
      expect(screen.getByText("step1")).toBeInTheDocument();
      expect(screen.getByText(Config.sectionHeaders.PLAN)).toBeInTheDocument();
      expect(screen.getByText(Config.sectionHeaders.START)).toBeInTheDocument();
    });

    it("hide drawer when mini-roadmap task is clicked", async () => {
      useMockBusiness({});
      useMockRoadmap(
        generateRoadmap({
          steps: [generateStep({ name: "step1", stepNumber: 1 })],
          tasks: [generateTask({ name: "task1", stepNumber: 1 })],
        })
      );
      render(
        <NavBarMobile
          currentlyOnboarding={false}
          isAuthenticated={true}
          isLanding={false}
          scrolled={false}
          task={undefined}
          hideMiniRoadmap={false}
          showSidebar={true}
          previousBusinessId={undefined}
        />
      );

      fireEvent.click(screen.getByTestId("nav-menu-mobile-account-open"));

      fireEvent.click(screen.getByText("step1"));
      fireEvent.click(screen.getByText("task1"));

      await waitForElementToBeRemoved(() => {
        return screen.queryByTestId("nav-sidebar-menu");
      });
      expect(screen.queryByText("task1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("nav-sidebar-menu")).not.toBeInTheDocument();
    });
  });
});

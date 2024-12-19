import { NavBarDesktop } from "@/components/navbar/desktop/NavBarDesktop";
import { getMergedConfig } from "@/contexts/configContext";
import { randomPublicFilingLegalStructure } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { generateBusiness, generateProfileData, generateUserData } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactNode } from "react";

const Config = getMergedConfig();

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
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

describe("<NavBarDesktop />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  const quickLinksExist = (): void => {
    expect(screen.getByText(Config.navigationQuickLinks.navBarPlanText)).toBeInTheDocument();
    expect(screen.getByText(Config.navigationQuickLinks.navBarStartText)).toBeInTheDocument();
    expect(screen.getByText(Config.navigationQuickLinks.navBarOperateText)).toBeInTheDocument();
    expect(screen.getByText(Config.navigationQuickLinks.navBarGrowText)).toBeInTheDocument();
    expect(screen.getByText(Config.navigationQuickLinks.navBarUpdatesText)).toBeInTheDocument();
    expect(screen.getByTestId("navbar-search-icon")).toBeInTheDocument();
  };

  const quickLinksDoNotExist = (): void => {
    expect(screen.queryByText(Config.navigationQuickLinks.navBarPlanText)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.navigationQuickLinks.navBarStartText)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.navigationQuickLinks.navBarOperateText)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.navigationQuickLinks.navBarGrowText)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.navigationQuickLinks.navBarUpdatesText)).not.toBeInTheDocument();
    expect(screen.queryByTestId("navbar-search-icon")).not.toBeInTheDocument();
  };

  describe("landing configuration", () => {
    it("shows quick links, login and dropdown", () => {
      render(<NavBarDesktop isLanding={true} currentlyOnboarding={false} isAuthenticated={false} />);
      quickLinksExist();
      expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
      expect(screen.getByTestId("nav-bar-desktop-dropdown-button")).toBeInTheDocument();
    });

    it("shows get started within the dropdown", () => {
      render(<NavBarDesktop isLanding={true} currentlyOnboarding={false} isAuthenticated={false} />);
      expect(screen.queryByText(Config.navigationDefaults.getStartedText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId("nav-bar-desktop-dropdown-button"));
      expect(screen.getByText(Config.navigationDefaults.getStartedText)).toBeInTheDocument();
    });
  });

  describe("seo starter kits configuration", () => {
    it("shows logo and login", () => {
      render(
        <NavBarDesktop
          isLanding={false}
          currentlyOnboarding={false}
          isAuthenticated={false}
          isSeoStarterKit={true}
        />
      );

      quickLinksDoNotExist();
      expect(screen.getByText(Config.navigationDefaults.navBarMyAccountText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
    });
  });

  describe("onboarding configuration", () => {
    it("shows login and dropdown", () => {
      render(<NavBarDesktop isLanding={false} currentlyOnboarding={true} isAuthenticated={false} />);

      quickLinksDoNotExist();
      expect(screen.getByTestId("nav-bar-desktop-dropdown-button")).toBeInTheDocument();
    });
  });

  describe("authenticated configuration", () => {
    it("shows quicklinks and dropdown", () => {
      render(<NavBarDesktop isLanding={false} currentlyOnboarding={false} isAuthenticated={true} />);
      quickLinksExist();
      expect(screen.queryByText(Config.navigationDefaults.logInButton)).not.toBeInTheDocument();
      expect(screen.getByTestId("nav-bar-desktop-dropdown-button")).toBeInTheDocument();
    });

    it("shows profile, add business, MyNj and logout in dropdown", () => {
      const firstBusiness = generateBusiness({
        profileData: generateProfileData({
          businessName: "first-biz",
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      const userData = generateUserData({
        currentBusinessId: firstBusiness.id,
        businesses: {
          [firstBusiness.id]: firstBusiness,
        },
      });
      render(
        <NavBarDesktop
          isLanding={false}
          currentlyOnboarding={false}
          isAuthenticated={true}
          userData={userData}
        />
      );

      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      expect(screen.queryByTestId("business-title-0")).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.addBusinessButton)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId("nav-bar-desktop-dropdown-button"));
      expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      expect(screen.getByTestId("business-title-0")).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.addBusinessButton)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.myNJAccountText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.logoutButton)).toBeInTheDocument();
    });
  });

  describe("guest configuration", () => {
    it("shows quicklinks, login and dropdown", () => {
      render(<NavBarDesktop isLanding={false} currentlyOnboarding={false} isAuthenticated={false} />);
      quickLinksExist();
      expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
      expect(screen.getByTestId("nav-bar-desktop-dropdown-button")).toBeInTheDocument();
    });

    it("shows profile and regsiter in dropdown", () => {
      const userData = generateUserData({});
      render(
        <NavBarDesktop
          isLanding={false}
          currentlyOnboarding={false}
          isAuthenticated={false}
          userData={userData}
        />
      );

      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.navBarGuestBusinessText)).toBeInTheDocument();
      expect(
        screen.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId("nav-bar-desktop-dropdown-button"));
      expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      expect(screen.getAllByText(Config.navigationDefaults.navBarGuestBusinessText)).toHaveLength(2);

      expect(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeInTheDocument();
    });
  });
});

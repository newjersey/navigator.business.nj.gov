import {
  AddBusinessItem,
  GetStartedMenuItem,
  Grow,
  LoginMenuItem,
  LogoutMenuItem,
  MyNjMenuItem,
  Operate,
  Plan,
  ProfileMenuItem,
  RegisterMenuItem,
  Search,
  Start,
  Updates,
} from "@/components/navbar/shared-submenu-components";
import { getMergedConfig } from "@/contexts/configContext";
import { onSignOut } from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { randomPublicFilingLegalStructure } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { generateBusiness, generateProfileData, generateUserData } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => {
  const originalSigninHelper = jest.requireActual("@/lib/auth/signinHelper");
  return {
    ...originalSigninHelper,
    onSignOut: jest.fn(),
  };
});
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock(
  "next/link",
  () =>
    ({ children }: { children: ReactNode }): ReactNode =>
      children
);

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      mobile_hamburger_quick_links_search: {
        click: {
          search_page: jest.fn(),
        },
      },
      mobile_hamburger_quick_links_updates: {
        click: {
          updates_page: jest.fn(),
        },
      },
      mobile_hamburger_quick_links_grow: {
        click: {
          grow_page: jest.fn(),
        },
      },
      mobile_hamburger_quick_links_start: {
        click: {
          start_page: jest.fn(),
        },
      },
      mobile_hamburger_quick_links_plan: {
        click: {
          plan_page: jest.fn(),
        },
      },
      mobile_hamburger_quick_links_operate: {
        click: {
          operate_page: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("shared-submenu-components", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  const Config = getMergedConfig();
  window.open = jest.fn();

  it("renders LoginMenuItem and it navigates correclty onClick", () => {
    render(<LoginMenuItem />);
    expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.navigationDefaults.logInButton));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.login);
  });

  it("renders LogoutMenuItem and it navigates correclty onClick", () => {
    render(<LogoutMenuItem handleClose={() => null} />);
    expect(screen.getByText(Config.navigationDefaults.logoutButton)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.navigationDefaults.logoutButton));
    expect(onSignOut).toHaveBeenCalled();
  });

  it("renders MyNjMenuItem and it navigates correclty onClick", () => {
    render(<MyNjMenuItem handleClose={() => null} />);
    expect(screen.getByText(Config.navigationDefaults.myNJAccountText)).toBeInTheDocument();
    const openMock = jest.fn();
    global.open = openMock;

    const profileLink = "www.njprofilelink.com";
    process.env.MYNJ_PROFILE_LINK = profileLink;

    fireEvent.click(screen.getByText(Config.navigationDefaults.myNJAccountText));
    expect(openMock).toHaveBeenCalledWith(profileLink, "_blank", "noopener noreferrer");
  });

  it("renders AddBusinessItem and it navigates correclty onClick", () => {
    render(<AddBusinessItem handleClose={() => null} />);
    expect(screen.getByText(Config.navigationDefaults.addBusinessButton)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.navigationDefaults.addBusinessButton));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: ROUTES.onboarding,
      query: { additionalBusiness: "true" },
    });
  });

  it("renders RegisterMenuItem and navigates correclty onClick", () => {
    render(<RegisterMenuItem />);
    expect(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.accountSetup);
  });

  it("renders GetStartedMenuItem and navigates correclty onClick", () => {
    render(<GetStartedMenuItem />);
    expect(screen.getByText(Config.navigationDefaults.getStartedText)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.navigationDefaults.getStartedText));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  describe("ProfileMenuItem", () => {
    it("renders ProfileMenuItem and navigates to dashbaord correclty onClick", () => {
      const userData = generateUserData({});
      render(<ProfileMenuItem handleClose={() => null} isAuthenticated={false} userData={userData} />);
      expect(screen.getByText(Config.navigationDefaults.navBarGuestBusinessText)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestBusinessText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });

    it("renders ProfileMenuItem and navigates correclty onClick", () => {
      const userData = generateUserData({});
      render(<ProfileMenuItem handleClose={() => null} isAuthenticated={false} userData={userData} />);
      expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.navigationDefaults.profileLinkText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
    });

    it("renders multiple businesses", () => {
      const firstBusiness = generateBusiness({
        profileData: generateProfileData({
          businessName: "first-biz",
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      const secondBusiness = generateBusiness({
        profileData: generateProfileData({
          businessName: "second-biz",
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      const userData = generateUserData({
        currentBusinessId: firstBusiness.id,
        businesses: {
          [firstBusiness.id]: firstBusiness,
          [secondBusiness.id]: secondBusiness,
        },
      });

      render(<ProfileMenuItem handleClose={() => null} isAuthenticated={true} userData={userData} />);

      expect(screen.getByText("first-biz")).toBeInTheDocument();
      expect(screen.getByText("second-biz")).toBeInTheDocument();
    });

    it("only shows profile link for current business", () => {
      const firstBusiness = generateBusiness({
        profileData: generateProfileData({ businessName: "first-biz" }),
      });
      const secondBusiness = generateBusiness({
        profileData: generateProfileData({ businessName: "second-biz" }),
      });
      const userData = generateUserData({
        currentBusinessId: firstBusiness.id,
        businesses: {
          [firstBusiness.id]: firstBusiness,
          [secondBusiness.id]: secondBusiness,
        },
      });
      render(<ProfileMenuItem handleClose={() => null} isAuthenticated={true} userData={userData} />);

      expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
    });
  });

  it("renders the Plan MenuItem redirects", async () => {
    render(<Plan />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarPlanText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarPlanLink,
      "_blank",
      "noopener noreferrer"
    );

    await waitFor(() => {
      expect(mockAnalytics.event.mobile_hamburger_quick_links_plan.click.plan_page).toHaveBeenCalled();
    });
  });

  it("renders the Operate MenuItem redirects", async () => {
    render(<Operate />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarOperateText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarOperateLink,
      "_blank",
      "noopener noreferrer"
    );

    await waitFor(() => {
      expect(mockAnalytics.event.mobile_hamburger_quick_links_operate.click.operate_page).toHaveBeenCalled();
    });
  });

  it("renders the Grow MenuItem redirects", async () => {
    render(<Grow />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarGrowText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarGrowLink,
      "_blank",
      "noopener noreferrer"
    );

    await waitFor(() => {
      expect(mockAnalytics.event.mobile_hamburger_quick_links_grow.click.grow_page).toHaveBeenCalled();
    });
  });

  it("renders the Updates MenuItem redirects", async () => {
    render(<Updates />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarUpdatesText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarUpdatesLink,
      "_blank",
      "noopener noreferrer"
    );

    await waitFor(() => {
      expect(mockAnalytics.event.mobile_hamburger_quick_links_updates.click.updates_page).toHaveBeenCalled();
    });
  });

  it("renders the Search MenuItem redirects", async () => {
    render(<Search />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarSearchText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarSearchLink,
      "_blank",
      "noopener noreferrer"
    );
    await waitFor(() => {
      expect(mockAnalytics.event.mobile_hamburger_quick_links_search.click.search_page).toHaveBeenCalled();
    });
  });

  it("renders the Start MenuItem redirects", async () => {
    render(<Start />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarStartText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarStartLink,
      "_blank",
      "noopener noreferrer"
    );
    await waitFor(() => {
      expect(mockAnalytics.event.mobile_hamburger_quick_links_start.click.start_page).toHaveBeenCalled();
    });
  });
});

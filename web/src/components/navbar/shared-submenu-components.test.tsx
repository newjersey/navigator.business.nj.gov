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
  Updates,
} from "@/components/navbar/shared-submenu-components";
import { getMergedConfig } from "@/contexts/configContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSelfRegister, onSignOut } from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import { randomPublicFilingLegalStructure } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { generateBusiness, generateProfileData, generateUserData } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactNode } from "react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => {
  const originalSigninHelper = jest.requireActual("@/lib/auth/signinHelper");
  return {
    ...originalSigninHelper,
    onSelfRegister: jest.fn(),
    onSignOut: jest.fn(),
  };
});
jest.mock("@/lib/auth/sessionHelper", () => ({
  triggerSignIn: jest.fn(),
}));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock(
  "next/link",
  () =>
    ({ children }: { children: ReactNode }): ReactNode =>
      children
);

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
    expect(triggerSignIn).toHaveBeenCalled();
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
    expect(onSelfRegister).toHaveBeenCalled();
  });

  it("renders GetStartedMenuItem and navigates correclty onClick", () => {
    render(<GetStartedMenuItem />);
    expect(screen.getByText(Config.navigationDefaults.registerButton)).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.navigationDefaults.registerButton));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  describe("ProfileMenuItem", () => {
    it("renders ProfileMenuItem and navigates to dashbaord correclty onClick", () => {
      render(<ProfileMenuItem handleClose={() => null} isAuthenticated={false} />);
      expect(screen.getByText(Config.navigationDefaults.navBarGuestBusinessText)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestBusinessText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });

    it("renders ProfileMenuItem and navigates correclty onClick", () => {
      render(<ProfileMenuItem handleClose={() => null} isAuthenticated={false} />);
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

      useMockUserData(userData);
      render(
        <WithStatefulUserData initialUserData={userData}>
          <ProfileMenuItem handleClose={() => null} isAuthenticated={true} />
        </WithStatefulUserData>
      );

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

      useMockUserData(userData);
      render(
        <WithStatefulUserData initialUserData={userData}>
          <ProfileMenuItem handleClose={() => null} isAuthenticated={true} />
        </WithStatefulUserData>
      );

      expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
    });
  });

  it("renders the Plan MenuItem redirects", () => {
    render(<Plan />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarPlanLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the Operate MenuItem redirects", () => {
    render(<Operate />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarOperateLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the Grow MenuItem redirects", () => {
    render(<Grow />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarGrowLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the Updates MenuItem redirects", () => {
    render(<Updates />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarUpdatesLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the Search MenuItem redirects", () => {
    render(<Search />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarSearchText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarSearchLink,
      "_blank",
      "noopener noreferrer"
    );
  });
});

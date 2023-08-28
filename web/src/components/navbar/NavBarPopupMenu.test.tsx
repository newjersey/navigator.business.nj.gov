/* eslint-disable testing-library/no-render-in-setup */
import { NavBarPopupMenu, Props as NavBarPopupMenuProps } from "@/components/navbar/NavBarPopupMenu";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSelfRegister, onSignOut } from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import { randomPublicFilingLegalStructure } from "@/test/factories";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness, useMockUserData } from "@/test/mock/mockUseUserData";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  Business,
  generateBusiness,
  generateProfileData,
  generateUserData,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

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

const generateOnboardingBusiness = (overrides?: Partial<ProfileData>): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      businessName: "",
      tradeName: "",
      industryId: undefined,
      legalStructureId: undefined,
      ...overrides,
    }),
  });
};

describe("<NavBarPopupMenu />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  const renderNavBarPopupMenu = (params: {
    props: Partial<NavBarPopupMenuProps>;
    userData?: UserData;
    isAuthenticated?: IsAuthenticated;
  }): void => {
    render(
      withAuth(
        <WithStatefulUserData initialUserData={params.userData}>
          <NavBarPopupMenu
            handleClose={(): void => {}}
            open={true}
            hasCloseButton={false}
            menuConfiguration={"login"}
            {...params.props}
          />
        </WithStatefulUserData>,
        { isAuthenticated: params.isAuthenticated ?? IsAuthenticated.TRUE }
      )
    );
  };

  it("renders close button when hasCloseButton prop is true", () => {
    useMockBusiness({});
    renderNavBarPopupMenu({ props: { hasCloseButton: true } });
    expect(screen.getByTestId("close-button-nav-menu")).toBeInTheDocument();
  });

  it("doesn't render close button when handleClose prop is false", () => {
    useMockBusiness({});
    renderNavBarPopupMenu({ props: { hasCloseButton: false } });
    expect(screen.queryByTestId("close-button-nav-menu")).not.toBeInTheDocument();
  });

  it("triggers handleClose when close button is pressed", () => {
    const handleClose = jest.fn();
    useMockBusiness({});
    renderNavBarPopupMenu({ props: { hasCloseButton: true, handleClose: handleClose } });
    fireEvent.click(screen.getByTestId("close-button-nav-menu"));
    expect(handleClose).toHaveBeenCalled();
  });

  describe("menuConfiguration prop's various menu configurations", () => {
    describe("login configuration", () => {
      beforeEach(() => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "login" },
          isAuthenticated: IsAuthenticated.FALSE,
        });
      });

      it("shows login button", () => {
        expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
      });

      it("calls login function when login button is clicked", async () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.logInButton));
        expect(triggerSignIn).toHaveBeenCalled();
      });
    });

    describe("profile configuration", () => {
      beforeEach(() => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile" },
          isAuthenticated: IsAuthenticated.FALSE,
        });
      });

      it("shows profile button", () => {
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
        expect(screen.getByText(Config.navigationDefaults.navBarGuestText)).toBeInTheDocument();
      });

      it("sends user to profile when profile is clicked", () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.profileLinkText));
        expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
      });

      it("sends user to dashbaord when dashbaord link is clicked", () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestText));
        expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });
    });

    describe("profile-mynj-addbusiness-logout configuration", () => {
      it("shows profile, myNJ, add business, and logout buttons", () => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-mynj-addbusiness-logout" },
          isAuthenticated: IsAuthenticated.TRUE,
        });
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
        expect(screen.getByText(Config.navigationDefaults.myNJAccountText)).toBeInTheDocument();
        expect(screen.getByText(Config.navigationDefaults.addBusinessButton)).toBeInTheDocument();
        expect(screen.getByText(Config.navigationDefaults.logoutButton)).toBeInTheDocument();
      });

      it("shows multiple businesses", () => {
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
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-mynj-addbusiness-logout" },
          isAuthenticated: IsAuthenticated.TRUE,
        });

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
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-mynj-addbusiness-logout" },
          isAuthenticated: IsAuthenticated.TRUE,
        });

        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      });

      it("sends user to profile when profile is clicked", () => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-mynj-addbusiness-logout" },
          isAuthenticated: IsAuthenticated.TRUE,
        });
        fireEvent.click(screen.getByText(Config.navigationDefaults.profileLinkText));
        expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
      });

      it("sends user to dashboard when dashboard link is clicked", () => {
        useMockBusiness(generateOnboardingBusiness({ businessName: "some name" }));
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-mynj-addbusiness-logout" },
          isAuthenticated: IsAuthenticated.TRUE,
        });
        fireEvent.click(screen.getByText("some name"));
        expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });

      it("sends user to new business onboarding when add business is clicked", () => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-mynj-addbusiness-logout" },
          isAuthenticated: IsAuthenticated.TRUE,
        });
        fireEvent.click(screen.getByText(Config.navigationDefaults.addBusinessButton));
        expect(mockPush).toHaveBeenCalledWith({
          pathname: ROUTES.onboarding,
          query: { additionalBusiness: "true" },
        });
      });

      it("sends user to selfRegistration when registration button is clicked", async () => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-mynj-addbusiness-logout" },
          isAuthenticated: IsAuthenticated.TRUE,
        });
        const openMock = jest.fn();
        global.open = openMock;

        const profileLink = "www.njprofilelink.com";
        process.env.MYNJ_PROFILE_LINK = profileLink;

        fireEvent.click(screen.getByText(Config.navigationDefaults.myNJAccountText));
        expect(openMock).toHaveBeenCalledWith(profileLink, "_ blank");
      });

      it("sends user to landing when logout button is clicked", async () => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-mynj-addbusiness-logout" },
          isAuthenticated: IsAuthenticated.TRUE,
        });
        fireEvent.click(screen.getByText(Config.navigationDefaults.logoutButton));
        expect(onSignOut).toHaveBeenCalled();
      });
    });

    describe("profile-register-login configuration", () => {
      beforeEach(() => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "profile-register-login" },
          isAuthenticated: IsAuthenticated.FALSE,
        });
      });

      it("shows profile, register and login buttons", () => {
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
        expect(screen.getByText(Config.navigationDefaults.navBarGuestText)).toBeInTheDocument();
        expect(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeInTheDocument();
        expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
      });

      it("sends user to profile when profile link is clicked", () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.profileLinkText));
        expect(mockPush).toHaveBeenCalledWith(ROUTES.profile);
      });

      it("sends user to dashbaord when dashbaord link is clicked", () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestText));
        expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });

      it("sends user to selfRegistration when registration button is clicked", async () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText));

        expect(onSelfRegister).toHaveBeenCalled();
      });

      it("calls login function when login button is clicked", async () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.logInButton));
        expect(triggerSignIn).toHaveBeenCalled();
      });
    });

    describe("login-getstarted configuration", () => {
      beforeEach(() => {
        useMockBusiness(generateOnboardingBusiness());
        renderNavBarPopupMenu({
          props: { menuConfiguration: "login-getstarted" },
          isAuthenticated: IsAuthenticated.FALSE,
        });
      });

      it("shows login and getstarted buttons", () => {
        expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
        expect(screen.getByText(Config.navigationDefaults.registerButton)).toBeInTheDocument();
      });

      it("sends user to onboarding when signup is clicked", () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.registerButton));
        expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
      });

      it("calls login function when login button is clicked", async () => {
        fireEvent.click(screen.getByText(Config.navigationDefaults.logInButton));
        expect(triggerSignIn).toHaveBeenCalled();
      });
    });
  });
});

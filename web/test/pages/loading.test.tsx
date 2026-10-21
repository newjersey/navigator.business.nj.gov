import { IsAuthenticated } from "@/lib/auth/AuthContext";
import * as profileNJFirstLogin from "@/lib/auth/profileNjFirstLogin";
import { getActiveUser, triggerSignIn } from "@/lib/auth/sessionHelper";
import * as signinHelper from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import LoadingPage, { signInSamlError } from "@/pages/loading";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  generateUseUserDataResponse,
  setMockUserDataResponse,
  useMockBusiness,
  useMockProfileData,
} from "@/test/mock/mockUseUserData";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generatePreferences,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onGuestSignIn: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onGuestSignIn: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/auth/sessionHelper", () => ({
  triggerSignIn: jest.fn(),
  getActiveUser: jest.fn(),
}));
jest.mock("@/lib/auth/profileNjFirstLogin", () => ({
  ensureProfileNJUserRecord: jest.fn(),
  createProfileNJFirstLoginDependencies: jest.fn(),
}));

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      landing_page: {
        arrive: {
          get_unlinked_myNJ_account: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const mockSigninHelper = signinHelper as jest.Mocked<typeof signinHelper>;
const mockProfileNJFirstLogin = profileNJFirstLogin as jest.Mocked<typeof profileNJFirstLogin>;
const mockGetActiveUser = getActiveUser as jest.MockedFunction<typeof getActiveUser>;

describe("loading page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  afterEach(() => {
    process.env.FEATURE_LOGIN_PAGE = "true";
  });

  it("redirects STARTING users to dashboard", async () => {
    useMockProfileData({ businessPersona: "STARTING" });
    render(<LoadingPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("redirects FOREIGN users to dashboard", async () => {
    useMockProfileData({ businessPersona: "FOREIGN" });
    render(<LoadingPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("redirects OWNING users to dashboard", async () => {
    useMockProfileData({ businessPersona: "OWNING" });
    render(<LoadingPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("redirects to onboarding if user has not yet completed onboarding", () => {
    useMockBusiness({
      onboardingFormProgress: "UNSTARTED",
      profileData: generateProfileData({ businessPersona: "STARTING" }),
    });
    render(<LoadingPage />);
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ pathname: ROUTES.onboarding }));
  });

  it("redirects user to returnToLink page url if they have one and resets returnToLink", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({ businessPersona: "STARTING" }),
      preferences: generatePreferences({ returnToLink: "/tasks/some-task" }),
      onboardingFormProgress: "COMPLETED",
    });
    setupStatefulUserDataContext();
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <LoadingPage />
      </WithStatefulUserData>,
    );
    await waitFor(() => {
      expect(currentBusiness().preferences.returnToLink).toEqual("");
    });
    expect(mockPush).toHaveBeenCalledWith("/tasks/some-task");
  });

  it("triggers error message when user has a myNJ linking signin error", async () => {
    setMockUserDataResponse(generateUseUserDataResponse({ userData: undefined }));
    useMockRouter({ isReady: true, asPath: signInSamlError });
    mockSigninHelper.onGuestSignIn.mockResolvedValue();

    render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE }));

    expect(mockAnalytics.event.landing_page.arrive.get_unlinked_myNJ_account).toHaveBeenCalled();
    expect(screen.getByText("Login Issues Help page")).toBeInTheDocument();
  });

  it("redirects to the email check login page as a fallback if other conditions aren't met and the login page is enabled", async () => {
    setMockUserDataResponse(generateUseUserDataResponse({ userData: undefined }));
    useMockRouter({ isReady: true, asPath: "not-a-saml-error" });

    render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.login);
  });

  it("attempts to trigger sign in as a fallback if other conditions aren't met and the login page is disabled", async () => {
    process.env.FEATURE_LOGIN_PAGE = "false";
    setMockUserDataResponse(generateUseUserDataResponse({ userData: undefined }));
    useMockRouter({ isReady: true, asPath: "not-a-saml-error" });

    render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(triggerSignIn).toHaveBeenCalled();
  });

  describe("returning from a sign-in with a code", () => {
    const activeUser = {
      id: "r-1",
      email: "jane@example.com",
      signInProvider: "ProfileNJ" as const,
    };

    beforeEach(() => {
      setMockUserDataResponse(generateUseUserDataResponse({ userData: undefined }));
      useMockRouter({ isReady: true, query: { code: "x" } });
      mockGetActiveUser.mockResolvedValue(activeUser);
    });

    it("ensures the ProfileNJ user's record exists before logging in", async () => {
      mockProfileNJFirstLogin.ensureProfileNJUserRecord.mockResolvedValue();
      const dependencies = {
        getUserData: jest.fn(),
        postUserData: jest.fn(),
        getGuestUserData: jest.fn(),
        removeGuestUserData: jest.fn(),
      };
      mockProfileNJFirstLogin.createProfileNJFirstLoginDependencies.mockReturnValue(dependencies);
      const dispatch = jest.fn();

      render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE, dispatch }));

      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({ type: "LOGIN", activeUser });
      });
      expect(mockProfileNJFirstLogin.ensureProfileNJUserRecord).toHaveBeenCalledWith(
        activeUser,
        dependencies,
      );
      expect(
        mockProfileNJFirstLogin.ensureProfileNJUserRecord.mock.invocationCallOrder[0],
      ).toBeLessThan(dispatch.mock.invocationCallOrder[0]);
    });

    it("shows the error state and does not log in when saving the first record fails", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockProfileNJFirstLogin.ensureProfileNJUserRecord.mockRejectedValue(500);
      const dispatch = jest.fn();

      render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE, dispatch }));

      expect(await screen.findByText(Config.loginSupportPage.havingTrouble)).toBeInTheDocument();
      expect(dispatch).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to complete sign-in", 500);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("returning from a sign-in with an error", () => {
    const originalFlag = process.env.FEATURE_PROFILE_NJ_LOGIN;

    afterEach(() => {
      if (originalFlag === undefined) {
        delete process.env.FEATURE_PROFILE_NJ_LOGIN;
      } else {
        process.env.FEATURE_PROFILE_NJ_LOGIN = originalFlag;
      }
    });

    beforeEach(() => {
      setMockUserDataResponse(generateUseUserDataResponse({ userData: undefined }));
      useMockRouter({
        isReady: true,
        query: { error: "access_denied", error_description: "denied" },
        asPath: "/loading?error=access_denied&error_description=denied",
      });
    });

    const renderWithErrorQuery = (): void => {
      render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE }));
    };

    it("shows the error state instead of redirecting when the ProfileNJ flag is on", async () => {
      process.env.FEATURE_PROFILE_NJ_LOGIN = "true";
      renderWithErrorQuery();

      expect(await screen.findByText(Config.loginSupportPage.havingTrouble)).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalledWith(ROUTES.login);
    });

    it("still redirects to login when the ProfileNJ flag is off", async () => {
      process.env.FEATURE_PROFILE_NJ_LOGIN = "false";
      renderWithErrorQuery();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(ROUTES.login);
      });
    });
  });
});

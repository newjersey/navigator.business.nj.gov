import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import * as sessionHelper from "@/lib/auth/sessionHelper";
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
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      landing_page: {
        arrive: {
          get_unlinked_myNJ_account_modal: jest.fn(),
        },
      },
    },
  };
}

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onGuestSignIn: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const mockSessionHelper = sessionHelper as jest.Mocked<typeof sessionHelper>;
const mockSigninHelper = signinHelper as jest.Mocked<typeof signinHelper>;

const Config = getMergedConfig();

describe("loading page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    mockSessionHelper.triggerSignIn.mockResolvedValue();
  });

  it("redirects STARTING users to dashboard", () => {
    useMockProfileData({ businessPersona: "STARTING" });
    render(<LoadingPage />);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("redirects FOREIGN users to dashboard", () => {
    useMockProfileData({ businessPersona: "FOREIGN" });
    render(<LoadingPage />);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("redirects OWNING users to dashbaord", () => {
    useMockProfileData({ businessPersona: "OWNING" });
    render(<LoadingPage />);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("redirects to onboarding if user has not yet completed onboarding", () => {
    useMockBusiness({
      onboardingFormProgress: "UNSTARTED",
      profileData: generateProfileData({ businessPersona: "STARTING" }),
    });
    render(<LoadingPage />);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
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

  it("shows modal when user has signin error and redirects user to onboarding", async () => {
    setMockUserDataResponse(generateUseUserDataResponse({ userData: undefined }));
    useMockRouter({ isReady: true, asPath: signInSamlError });
    mockSigninHelper.onGuestSignIn.mockResolvedValue();
    render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockSessionHelper.triggerSignIn).not.toHaveBeenCalled();
    expect(screen.getByText(Config.selfRegistration.loginErrorModalTitle)).toBeInTheDocument();
    expect(mockAnalytics.event.landing_page.arrive.get_unlinked_myNJ_account_modal).toHaveBeenCalled();

    fireEvent.click(screen.getByText(Config.selfRegistration.loginErrorModalContinueButton));
    await waitFor(() => {
      return expect(mockSigninHelper.onGuestSignIn).toHaveBeenCalled();
    });
  });
});

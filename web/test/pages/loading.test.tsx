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
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generatePreferences,
  generateProfileData,
  generateUserData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { render, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onGuestSignIn: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onGuestSignIn: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

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
const mockSessionHelper = sessionHelper as jest.Mocked<typeof sessionHelper>;
const mockSigninHelper = signinHelper as jest.Mocked<typeof signinHelper>;

describe("loading page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    mockSessionHelper.triggerSignIn.mockResolvedValue();
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

  it("redirects OWNING users to dashbaord", async () => {
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
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  it("redirects user to returnToLink page url if they have one and resets returnToLink", async () => {
    const business = generateBusiness(generateUserData({}), {
      profileData: generateProfileData({ businessPersona: "STARTING" }),
      preferences: generatePreferences({ returnToLink: "/tasks/some-task" }),
      onboardingFormProgress: "COMPLETED",
    });
    setupStatefulUserDataContext();
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <LoadingPage />
      </WithStatefulUserData>
    );
    await waitFor(() => {
      expect(currentBusiness().preferences.returnToLink).toEqual("");
    });
    expect(mockPush).toHaveBeenCalledWith("/tasks/some-task");
  });

  it("triggers onGuestSignIn with encounteredMyNjLinkingError param when user has signin error", async () => {
    setMockUserDataResponse(generateUseUserDataResponse({ userData: undefined }));
    useMockRouter({ isReady: true, asPath: signInSamlError });
    mockSigninHelper.onGuestSignIn.mockResolvedValue();

    render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE }));

    expect(mockSessionHelper.triggerSignIn).not.toHaveBeenCalled();
    expect(mockAnalytics.event.landing_page.arrive.get_unlinked_myNJ_account).toHaveBeenCalled();
    return expect(mockSigninHelper.onGuestSignIn).toHaveBeenCalledWith({
      push: expect.anything(),
      pathname: expect.anything(),
      dispatch: expect.anything(),
      encounteredMyNjLinkingError: true,
    });
  });
});

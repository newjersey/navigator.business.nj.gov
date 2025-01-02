import { IsAuthenticated } from "@/lib/auth/AuthContext";
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
import { render, waitFor } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("@/lib/auth/signinHelper", () => ({ onGuestSignIn: vi.fn() }));
vi.mock("@/lib/auth/signinHelper", () => ({ onGuestSignIn: vi.fn() }));
vi.mock("@/lib/utils/analytics", () => setupMockAnalytics());

function setupMockAnalytics(): typeof analytics {
  return {
    ...vi.requireActual("@/lib/utils/analytics").default,
    event: {
      ...vi.requireActual("@/lib/utils/analytics").default.event,
      landing_page: {
        arrive: {
          get_unlinked_myNJ_account: vi.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as vi.Mocked<typeof analytics>;
const mockSigninHelper = signinHelper as vi.Mocked<typeof signinHelper>;

describe("loading page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
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

    expect(mockAnalytics.event.landing_page.arrive.get_unlinked_myNJ_account).toHaveBeenCalled();
    return expect(mockSigninHelper.onGuestSignIn).toHaveBeenCalledWith({
      push: expect.anything(),
      pathname: expect.anything(),
      dispatch: expect.anything(),
      encounteredMyNjLinkingError: true,
    });
  });

  it("redirects to the email check login page as a fallback if other conditions aren't met", async () => {
    setMockUserDataResponse(generateUseUserDataResponse({ userData: undefined }));
    useMockRouter({ isReady: true, asPath: "not-a-saml-error" });

    render(withAuth(<LoadingPage />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.login);
  });
});

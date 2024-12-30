import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import Home from "@/pages/index";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setMockUserDataResponse, useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateProfileData } from "@businessnjgovnavigator/shared";
import { render } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/useIntersectionOnElement", () => ({ useIntersectionOnElement: jest.fn() }));

describe("HomePage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  it("redirects to dashboard page when user has completed onboarding flow", () => {
    useMockBusiness({
      onboardingFormProgress: "COMPLETED",
      profileData: generateProfileData({ businessPersona: "STARTING" }),
    });
    render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.TRUE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("redirects to onboarding page when user has not completed onboarding flow", () => {
    useMockBusiness({ onboardingFormProgress: "UNSTARTED" });
    render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.TRUE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  it("redirects to dashboard page when it is unknown if user has completed onboarding flow or not", () => {
    setMockUserDataResponse({ error: "NO_DATA", userData: undefined });
    render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.TRUE }));
    expect(mockPush).toHaveBeenCalledWith(`${ROUTES.dashboard}?error=true`);
  });

  it("redirects to onboarding with signUp = true in the querystring", () => {
    useMockRouter({ isReady: true, query: { signUp: "true" } });
    setMockUserDataResponse({ error: undefined, userData: undefined });
    render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  it("stays on homepage with signUp = false in the querystrings", () => {
    useMockRouter({ isReady: true, query: { signUp: "false" } });
    setMockUserDataResponse({ error: undefined, userData: undefined });
    render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

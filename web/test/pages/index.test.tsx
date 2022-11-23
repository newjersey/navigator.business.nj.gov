import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import Home from "@/pages/index";
import { generateProfileData, generateUser } from "@/test/factories";
import { withAuth } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setMockUserDataResponse, useMockUserData } from "@/test/mock/mockUseUserData";
import { render } from "@testing-library/react";

jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/utils/useIntersectionOnElement", () => {
  return { useIntersectionOnElement: jest.fn() };
});

describe("HomePage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  it("redirects to dashboard page when user has completed onboarding flow", () => {
    useMockUserData({
      formProgress: "COMPLETED",
      profileData: generateProfileData({ businessPersona: "STARTING" }),
    });
    render(withAuth(<Home />, { user: generateUser({}) }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("redirects to onboarding page when user has not completed onboarding flow", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    render(withAuth(<Home />, { user: generateUser({}) }));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  it("redirects to dashboard page when it is unknown if user has completed onboarding flow or not", () => {
    setMockUserDataResponse({ error: "NO_DATA", userData: undefined });
    render(withAuth(<Home />, { user: generateUser({}) }));
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

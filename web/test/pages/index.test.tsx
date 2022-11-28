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

  describe("when LANDING_PAGE_REDIRECT disabled", () => {
    let originalValue: string | undefined;

    beforeEach(() => {
      originalValue = process.env.FEATURE_LANDING_PAGE_REDIRECT;
      process.env.FEATURE_LANDING_PAGE_REDIRECT = "false";
    });

    afterEach(() => {
      process.env.FEATURE_LANDING_PAGE_REDIRECT = originalValue;
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

  describe("when LANDING_PAGE_REDIRECT enabled", () => {
    let originalFeatureFlag: string | undefined;
    let originalUrl: string | undefined;

    beforeEach(() => {
      originalFeatureFlag = process.env.FEATURE_LANDING_PAGE_REDIRECT;
      originalUrl = process.env.ALTERNATE_LANDING_PAGE_URL;
      process.env.FEATURE_LANDING_PAGE_REDIRECT = "true";
      process.env.ALTERNATE_LANDING_PAGE_URL = "www.example.com";
    });

    afterEach(() => {
      process.env.FEATURE_LANDING_PAGE_REDIRECT = originalFeatureFlag;
      process.env.ALTERNATE_LANDING_PAGE_URL = originalUrl;
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

    it("redirects to alternate landing page when user not authenticated", () => {
      setMockUserDataResponse({ error: undefined, userData: undefined });
      render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.FALSE }));
      expect(mockPush).toHaveBeenCalledWith("www.example.com");
    });
  });
});

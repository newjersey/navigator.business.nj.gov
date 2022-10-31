import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import * as sessionHelper from "@/lib/auth/sessionHelper";
import * as signinHelper from "@/lib/auth/signinHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import LoadingPage, { signInSamlError } from "@/pages/loading";
import { generatePreferences, generateProfileData, generateUserData } from "@/test/factories";
import { generateUseUserDataResponse, withAuth } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setMockUserDataResponse, useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/auth/sessionHelper", () => {
  return { triggerSignIn: jest.fn() };
});
jest.mock("@/lib/auth/signinHelper", () => {
  return { onGuestSignIn: jest.fn() };
});
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
    useMockUserData({
      formProgress: "UNSTARTED",
      profileData: generateProfileData({ businessPersona: "STARTING" }),
    });
    render(<LoadingPage />);
    expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
  });

  it("redirects user to returnToLink page url if they have one and resets returnToLink", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({ businessPersona: "STARTING" }),
      preferences: generatePreferences({ returnToLink: "/tasks/some-task" }),
    });
    setupStatefulUserDataContext();
    render(
      <WithStatefulUserData initialUserData={userData}>
        <LoadingPage />
      </WithStatefulUserData>
    );
    await waitFor(() => {
      expect(currentUserData().preferences.returnToLink).toEqual("");
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
    fireEvent.click(screen.getByText(Config.selfRegistration.loginErrorModalContinueButton));
    await waitFor(() => {
      return expect(mockSigninHelper.onGuestSignIn).toHaveBeenCalled();
    });
  });
});

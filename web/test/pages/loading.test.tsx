import * as sessionHelper from "@/lib/auth/sessionHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import LoadingPage from "@/pages/loading";
import { generatePreferences, generateProfileData, generateUserData } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { render, waitFor } from "@testing-library/react";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));
const mockSessionHelper = sessionHelper as jest.Mocked<typeof sessionHelper>;

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
});

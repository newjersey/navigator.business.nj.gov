import Home from "@/pages/index";
import { renderWithUser } from "@/test/helpers";
import { generateUser } from "@/test/factories";
import { useMockUserData, setMockUserDataResponse } from "@/test/mock/mockUseUserData";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("HomePage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  it("redirects to roadmap page when user has completed onboarding flow", () => {
    useMockUserData({ formProgress: "COMPLETED" });
    renderWithUser(<Home />, { user: generateUser({}) });
    expect(mockPush).toHaveBeenCalledWith("/roadmap");
  });

  it("redirects to onboarding page when user has not completed onboarding flow", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderWithUser(<Home />, { user: generateUser({}) });
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });

  it("redirects to onboarding page when there is an error with retrieving the user's data", () => {
    setMockUserDataResponse({ error: "NO_DATA", userData: undefined });
    renderWithUser(<Home />, { user: generateUser({}) });
    expect(mockPush).toHaveBeenCalledWith("/roadmap");
  });
});

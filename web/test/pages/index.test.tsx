import Home from "@/pages/index";
import { withAuth } from "@/test/helpers";
import { generateUser } from "@/test/factories";
import { useMockUserData, setMockUserDataResponse } from "@/test/mock/mockUseUserData";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { render } from "@testing-library/react";

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
    render(withAuth(<Home />, { user: generateUser({}) }));
    expect(mockPush).toHaveBeenCalledWith("/roadmap");
  });

  it("redirects to onboarding page when user has not completed onboarding flow", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    render(withAuth(<Home />, { user: generateUser({}) }));
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });

  it("redirects to onboarding page when it is unknown if user has completed onboarding flow or not", () => {
    setMockUserDataResponse({ error: "NO_DATA", userData: undefined });
    render(withAuth(<Home />, { user: generateUser({}) }));
    expect(mockPush).toHaveBeenCalledWith("/roadmap");
  });
});

import { SelfRegDefaults } from "@/display-defaults/SelfRegDefaults";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import Home from "@/pages/index";
import { generateUser } from "@/test/factories";
import { withAuth } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setMockUserDataResponse, useMockUserData } from "@/test/mock/mockUseUserData";
import { render } from "@testing-library/react";
import React from "react";

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
  it("opens the modal with signUp = true in the querystring", () => {
    useMockRouter({ isReady: true, query: { signUp: "true" } });
    setMockUserDataResponse({ error: "NO_DATA", userData: undefined });
    const page = render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(page.getByText(SelfRegDefaults.signupTitleText)).toBeInTheDocument();
  });
  it("does not open the modal with signUp = false in the querystrings", () => {
    useMockRouter({ isReady: true, query: { signUp: "false" } });
    setMockUserDataResponse({ error: "NO_DATA", userData: undefined });
    const page = render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(page.queryByText(SelfRegDefaults.signupTitleText)).not.toBeInTheDocument();
  });

  it("renders one main element on the index page", () => {
    const subject = render(<Home />);
    expect(subject.getByTestId("main")).toBeInTheDocument();
    expect(subject.getByTestId("SPL-div-ele")).toBeInTheDocument();
    expect(subject.queryByTestId("SPL-main-ele")).not.toBeInTheDocument();
  });
});

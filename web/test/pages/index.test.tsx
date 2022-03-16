import { IsAuthenticated } from "@/lib/auth/AuthContext";
import Home from "@/pages/index";
import { generateUser } from "@/test/factories";
import { withAuth } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setMockUserDataResponse, useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render } from "@testing-library/react";
import React from "react";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("HomePage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  it("sends to onboarding when Get Started button clicked", () => {
    useMockUserData({});
    const subject = render(withAuth(<Home />, { user: generateUser({}) }));
    fireEvent.click(subject.getByText(Config.landingPage.heroCallToActionText));
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
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

  it("redirects to roadmap page when it is unknown if user has completed onboarding flow or not", () => {
    setMockUserDataResponse({ error: "NO_DATA", userData: undefined });
    render(withAuth(<Home />, { user: generateUser({}) }));
    expect(mockPush).toHaveBeenCalledWith("/roadmap?error=true");
  });

  it("redirects to onboarding with signUp = true in the querystring", () => {
    useMockRouter({ isReady: true, query: { signUp: "true" } });
    setMockUserDataResponse({ error: undefined, userData: undefined });
    render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });

  it("stays on homepage with signUp = false in the querystrings", () => {
    useMockRouter({ isReady: true, query: { signUp: "false" } });
    setMockUserDataResponse({ error: undefined, userData: undefined });
    render(withAuth(<Home />, { isAuthenticated: IsAuthenticated.FALSE }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders one main element on the index page", () => {
    const subject = render(<Home />);
    expect(subject.getByTestId("main")).toBeInTheDocument();
    expect(subject.getByTestId("SPL-div-ele")).toBeInTheDocument();
    expect(subject.queryByTestId("SPL-main-ele")).not.toBeInTheDocument();
  });
});

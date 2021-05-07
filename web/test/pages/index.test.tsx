import Home from "../../pages";
import { renderWithUser } from "../helpers";
import { generateUser } from "../factories";
import { useMockUserData } from "../mock/mockUseUserData";
import { mockPush, useMockRouter } from "../mock/mockRouter";
import { IsAuthenticated } from "../../lib/auth/AuthContext";

jest.mock("next/router");
jest.mock("../../lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("HomePage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  describe("when not logged in", () => {
    it("displays welcome text", () => {
      const subject = renderWithUser(<Home />, { isAuthenticated: IsAuthenticated.FALSE });

      expect(subject.queryByText("Welcome to EasyRegNJ")).toBeInTheDocument();
      expect(subject.queryByText("Log in")).toBeInTheDocument();
      expect(subject.queryByText("Log out")).not.toBeInTheDocument();
    });
  });

  describe("when logged in", () => {
    it("welcomes user by name", () => {
      const subject = renderWithUser(<Home />, { user: generateUser({ name: "Ada Lovelace" }) });

      expect(subject.queryByText("Welcome, Ada Lovelace")).toBeInTheDocument();
      expect(subject.queryByText("Get Started")).toBeInTheDocument();
      expect(subject.queryByText("Log out")).toBeInTheDocument();
      expect(subject.queryByText("Log in")).not.toBeInTheDocument();
    });

    it("welcomes user by email if no name present", () => {
      const subject = renderWithUser(<Home />, {
        user: generateUser({ name: undefined, email: "ada@lovelace.org" }),
      });

      expect(subject.queryByText("Welcome, ada@lovelace.org")).toBeInTheDocument();
      expect(subject.queryByText("Get Started")).toBeInTheDocument();
      expect(subject.queryByText("Log out")).toBeInTheDocument();
      expect(subject.queryByText("Log in")).not.toBeInTheDocument();
    });
  });

  describe("when user has completed onboarding flow", () => {
    it("redirects to roadmap page", () => {
      useMockUserData({ formProgress: "COMPLETED" });
      renderWithUser(<Home />, { user: generateUser({ name: "Ada Lovelace" }) });
      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });
  });
});

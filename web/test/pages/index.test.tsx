import Home from "../../pages";
import { generateUseUserDataResponse, renderWithUser } from "../helpers";
import { generateUser, generateUserData } from "../factories";
import { useRouter } from "next/router";
import * as useUserModule from "../../lib/data/useUserData";

jest.mock("next/router");
jest.mock("../../lib/data/useUserData", () => ({
  useUserData: jest.fn(),
}));
const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

describe("HomePage", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockPush,
    });
    mockUseUserData.mockReturnValue(generateUseUserDataResponse({}));
  });

  describe("when not logged in", () => {
    it("displays welcome text", () => {
      const subject = renderWithUser(<Home />, undefined, jest.fn());

      expect(subject.queryByText("Welcome to EasyRegNJ")).toBeInTheDocument();
      expect(subject.queryByText("Log in")).toBeInTheDocument();
      expect(subject.queryByText("Log out")).not.toBeInTheDocument();
    });
  });

  describe("when logged in", () => {
    it("welcomes user by name", () => {
      const subject = renderWithUser(<Home />, generateUser({ name: "Ada Lovelace" }), jest.fn());

      expect(subject.queryByText("Welcome, Ada Lovelace")).toBeInTheDocument();
      expect(subject.queryByText("Get Started")).toBeInTheDocument();
      expect(subject.queryByText("Log out")).toBeInTheDocument();
      expect(subject.queryByText("Log in")).not.toBeInTheDocument();
    });

    it("welcomes user by email if no name present", () => {
      const subject = renderWithUser(
        <Home />,
        generateUser({ name: undefined, email: "ada@lovelace.org" }),
        jest.fn()
      );

      expect(subject.queryByText("Welcome, ada@lovelace.org")).toBeInTheDocument();
      expect(subject.queryByText("Get Started")).toBeInTheDocument();
      expect(subject.queryByText("Log out")).toBeInTheDocument();
      expect(subject.queryByText("Log in")).not.toBeInTheDocument();
    });
  });

  describe("when user has completed onboarding flow", () => {
    it("redirects to roadmap page", () => {
      mockUseUserData.mockReturnValue(
        generateUseUserDataResponse({
          userData: generateUserData({ formProgress: "COMPLETED" }),
        })
      );
      renderWithUser(<Home />, generateUser({ name: "Ada Lovelace" }), jest.fn());
      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });
  });
});

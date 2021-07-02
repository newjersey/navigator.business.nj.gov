import Home from "@/pages/index";
import { renderWithUser } from "@/test/helpers";
import { generateUser } from "@/test/factories";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("HomePage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  describe("when user has completed onboarding flow", () => {
    it("redirects to roadmap page", () => {
      useMockUserData({ formProgress: "COMPLETED" });
      renderWithUser(<Home />, { user: generateUser({ name: "Ada Lovelace" }) });
      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });
  });
});

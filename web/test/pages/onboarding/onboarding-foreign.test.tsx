import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateProfileData, generateUserData } from "@/test/factories";
import { expectContent } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  mockEmptyApiSignups,
  renderPage,
  runSelfRegPageTests,
} from "@/test/pages/onboarding/helpers-onboarding";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { act, screen, waitFor } from "@testing-library/react";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const Config = getMergedConfig();

const generateTestUserData = (overrides: Partial<ProfileData>) =>
  generateUserData({
    profileData: generateProfileData({
      ...overrides,
    }),
    formProgress: "UNSTARTED",
  });

describe("onboarding - foreign business", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    mockEmptyApiSignups();
    setupStatefulUserDataContext();
    jest.useFakeTimers();
  });

  describe("page headers", () => {
    it("uses special template eval for step 1 label", () => {
      renderPage({});
      expect(
        screen.getByText(templateEval(Config.onboardingDefaults.stepXTemplate, { currentPage: "1" }))
      ).toBeInTheDocument();
    });

    it("uses special template eval for step 2 label", () => {
      const userData = generateTestUserData({ businessPersona: "FOREIGN" });
      useMockRouter({ isReady: true, query: { page: "2" } });
      renderPage({ userData });
      expect(
        screen.getByText(templateEval(Config.onboardingDefaults.stepXTemplate, { currentPage: "2" }))
      ).toBeInTheDocument();
    });

    it("uses standard template eval for step 3 label", () => {
      const userData = generateTestUserData({
        businessPersona: "FOREIGN",
        foreignBusinessType: "REMOTE_SELLER",
      });
      useMockRouter({ isReady: true, query: { page: "3" } });
      renderPage({ userData });
      expect(
        screen.getByText(
          templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "3", totalPages: "3" })
        )
      ).toBeInTheDocument();
    });
  });

  describe("page 2", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateTestUserData({
        businessPersona: "FOREIGN",
      });
      useMockRouter({ isReady: true, query: { page: "2" } });
    });

    it("displays out-of-state business question", () => {
      renderPage({ userData });
      expect(screen.getByLabelText("Out of state business")).toBeInTheDocument();
    });

    it("sets user as Remote Seller (and displays alert) when revenueInNJ checkbox checked", async () => {
      const { page } = renderPage({ userData });
      expectContent(
        Config.profileDefaults.FOREIGN.foreignBusinessType.REMOTE_SELLER,
        { exists: false },
        screen
      );
      page.checkByLabelText(Config.profileDefaults.FOREIGN.foreignBusinessType.optionContent.revenueInNJ);
      expectContent(
        Config.profileDefaults.FOREIGN.foreignBusinessType.REMOTE_SELLER,
        { exists: true },
        screen
      );

      await page.visitStep(3);
      expect(currentUserData().profileData.foreignBusinessType).toEqual("REMOTE_SELLER");
      expect(currentUserData().profileData.foreignBusinessTypeIds).toEqual(["revenueInNJ"]);
    });

    it("sets user as Remote Seller (and displays alert) when transactionsInNJ checkbox checked", async () => {
      const { page } = renderPage({ userData });
      expectContent(
        Config.profileDefaults.FOREIGN.foreignBusinessType.REMOTE_SELLER,
        { exists: false },
        screen
      );
      page.checkByLabelText(
        Config.profileDefaults.FOREIGN.foreignBusinessType.optionContent.transactionsInNJ
      );
      expectContent(
        Config.profileDefaults.FOREIGN.foreignBusinessType.REMOTE_SELLER,
        { exists: true },
        screen
      );

      await page.visitStep(3);
      expect(currentUserData().profileData.foreignBusinessType).toEqual("REMOTE_SELLER");
      expect(currentUserData().profileData.foreignBusinessTypeIds).toEqual(["transactionsInNJ"]);
    });

    it("prevents user from moving past Step 2 if no foreign business type checked", async () => {
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });

      act(() => page.clickNext());
      await waitFor(() => {
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.FOREIGN.foreignBusinessType.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("allows user to move past Step 2 if you have made a selection", async () => {
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.checkByLabelText(
        Config.profileDefaults.FOREIGN.foreignBusinessType.optionContent.transactionsInNJ
      );
      await page.visitStep(3);

      await waitFor(() => {
        expect(screen.getByTestId("step-3")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.FOREIGN.foreignBusinessType.errorTextRequired)
      ).not.toBeInTheDocument();
    });
  });

  describe("validates self-reg step", () => {
    runSelfRegPageTests({ businessPersona: "FOREIGN", selfRegPage: "3" });
  });
});

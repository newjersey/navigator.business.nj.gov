import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import { generateProfileData, generateUserData } from "@/test/factories";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
} from "@/test/mock/withStatefulUserData";
import {
  mockEmptyApiSignups,
  renderPage,
  runSelfRegPageTests,
} from "@/test/pages/onboarding/helpers-onboarding";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { act, screen, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const Config = getMergedConfig();
const { employeesInNJ, transactionsInNJ, revenueInNJ, operationsInNJ, none } =
  Config.profileDefaults.fields.foreignBusinessTypeIds.default.optionContent;

const generateTestUserData = (overrides: Partial<ProfileData>) => {
  return generateUserData({
    profileData: generateProfileData({
      ...overrides,
    }),
    formProgress: "UNSTARTED",
  });
};

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

    it("sets user as Nexus (and displays alert) when operationsInNJ checkbox checked", async () => {
      const { page } = renderPage({ userData });
      expect(
        screen.queryByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.NEXUS)
      ).not.toBeInTheDocument();
      page.checkByLabelText(operationsInNJ);
      expect(
        screen.getByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.NEXUS)
      ).toBeInTheDocument();

      await page.visitStep(3);
      expect(currentUserData().profileData.foreignBusinessType).toEqual("NEXUS");
      expect(currentUserData().profileData.foreignBusinessTypeIds).toEqual(["operationsInNJ"]);
    });

    it("sets user as Remote Workers (and displays alert) when employeesInNJ checkbox checked", async () => {
      const { page } = renderPage({ userData });
      expect(
        screen.queryByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.REMOTE_WORKER)
      ).not.toBeInTheDocument();
      page.checkByLabelText(employeesInNJ);
      expect(
        screen.getByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.REMOTE_WORKER)
      ).toBeInTheDocument();

      await page.visitStep(3);
      expect(currentUserData().profileData.foreignBusinessType).toEqual("REMOTE_WORKER");
      expect(currentUserData().profileData.foreignBusinessTypeIds).toEqual(["employeesInNJ"]);
    });

    it("sets user as Remote Seller (and displays alert) when revenueInNJ checkbox checked", async () => {
      const { page } = renderPage({ userData });
      expect(
        screen.queryByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.REMOTE_SELLER)
      ).not.toBeInTheDocument();
      page.checkByLabelText(revenueInNJ);
      expect(
        screen.getByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.REMOTE_SELLER)
      ).toBeInTheDocument();
      await page.visitStep(3);
      expect(currentUserData().profileData.foreignBusinessType).toEqual("REMOTE_SELLER");
      expect(currentUserData().profileData.foreignBusinessTypeIds).toEqual(["revenueInNJ"]);
    });

    it("sets user as Remote Seller (and displays alert) when transactionsInNJ checkbox checked", async () => {
      const { page } = renderPage({ userData });
      expect(
        screen.queryByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.REMOTE_SELLER)
      ).not.toBeInTheDocument();
      page.checkByLabelText(transactionsInNJ);
      expect(
        screen.getByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.REMOTE_SELLER)
      ).toBeInTheDocument();

      await page.visitStep(3);
      expect(currentUserData().profileData.foreignBusinessType).toEqual("REMOTE_SELLER");
      expect(currentUserData().profileData.foreignBusinessTypeIds).toEqual(["transactionsInNJ"]);
    });

    it("prevents user from moving past Step 2 if no foreign business type checked", async () => {
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });

      act(() => {
        return page.clickNext();
      });
      await waitFor(() => {
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("allows user to move past Step 2 if you have made a selection", async () => {
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.checkByLabelText(transactionsInNJ);
      await page.visitStep(3);

      await waitFor(() => {
        expect(screen.getByTestId("step-3")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.errorTextRequired)
      ).not.toBeInTheDocument();
    });

    it("deselects every other option if none is selected", async () => {
      const { page } = renderPage({ userData });
      page.checkByLabelText(employeesInNJ);
      page.checkByLabelText(transactionsInNJ);
      page.checkByLabelText(revenueInNJ);
      page.checkByLabelText(none);

      expect(screen.getByLabelText(none) as HTMLInputElement).toBeChecked();
      expect(screen.getByLabelText(employeesInNJ) as HTMLInputElement).not.toBeChecked();
      expect(screen.getByLabelText(transactionsInNJ) as HTMLInputElement).not.toBeChecked();
      expect(screen.getByLabelText(revenueInNJ) as HTMLInputElement).not.toBeChecked();
    });

    it("doesn't update user data when none is selected and submitted", async () => {
      const { page } = renderPage({ userData });
      page.checkByLabelText(none);
      act(() => {
        return page.clickNext();
      });

      await waitFor(() => {
        expect(userDataWasNotUpdated()).toBe(true);
      });
    });

    it("deselects none of the above when user selects a different option after selecting none of the above", async () => {
      const { page } = renderPage({ userData });
      page.checkByLabelText(none);
      page.checkByLabelText(transactionsInNJ);

      expect(screen.getByLabelText(transactionsInNJ) as HTMLInputElement).toBeChecked();
      expect(screen.getByLabelText(none) as HTMLInputElement).not.toBeChecked();
    });

    it("navigates to the unsupported page when the foreign business type is none", async () => {
      const { page } = renderPage({ userData });
      page.checkByLabelText(none);

      act(() => {
        return page.clickNext();
      });
      await waitFor(() => {
        return expect(mockPush).toHaveBeenCalledWith(ROUTES.unsupported);
      });
    });
  });

  describe("Remote Seller onboarding", () => {
    it("skips the industry, legal structure, and location questions", () => {
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
      expect(screen.getByText(Config.selfRegistration.nameFieldLabel)).toBeInTheDocument();
    });
  });

  describe("REMOTE_WORKER onboarding", () => {
    it("skips the industry, legal structure, and location questions", () => {
      const userData = generateTestUserData({
        businessPersona: "FOREIGN",
        foreignBusinessType: "REMOTE_WORKER",
      });

      useMockRouter({ isReady: true, query: { page: "3" } });
      renderPage({ userData });
      expect(
        screen.getByText(
          templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "3", totalPages: "3" })
        )
      ).toBeInTheDocument();
      expect(screen.getByText(Config.selfRegistration.nameFieldLabel)).toBeInTheDocument();
    });
  });

  describe("Nexus - step 3", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateTestUserData({
        industryId: undefined,
        businessPersona: "FOREIGN",
        foreignBusinessType: "NEXUS",
      });
      useMockRouter({ isReady: true, query: { page: "3" } });
    });

    it("displays step 3 of 6 total pages", () => {
      renderPage({ userData });
      expect(
        screen.getByText(
          templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "3", totalPages: "6" })
        )
      ).toBeInTheDocument();
    });

    it("displays industry question", async () => {
      const { page } = renderPage({ userData });
      page.selectByText("Industry", "All Other Businesses");
      await page.visitStep(4);
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
    });

    it("prevents user from moving past Step 3 if you have not selected an industry", async () => {
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      expect(screen.getByTestId("step-3")).toBeInTheDocument();
      expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });
  });

  describe("Nexus - step 4", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateTestUserData({
        industryId: "generic",
        legalStructureId: undefined,
        businessPersona: "FOREIGN",
        foreignBusinessType: "NEXUS",
      });
      useMockRouter({ isReady: true, query: { page: "4" } });
    });

    it("displays legal structure question", async () => {
      const { page } = renderPage({ userData });
      page.chooseRadio("general-partnership");
      await page.visitStep(5);
      expect(screen.queryByTestId("banner-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
    });

    it("prevents user from moving past Step 4 if you have not selected a legal structure", async () => {
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      expect(screen.getByTestId("step-4")).toBeInTheDocument();
      expect(screen.queryByTestId("step-5")).not.toBeInTheDocument();
      expect(screen.getByTestId("banner-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    });
  });

  describe("Nexus - step 5", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateTestUserData({
        industryId: "generic",
        legalStructureId: "limited-liability-company",
        businessPersona: "FOREIGN",
        foreignBusinessType: "NEXUS",
        municipality: undefined,
        homeBasedBusiness: undefined,
      });
      useMockRouter({ isReady: true, query: { page: "5" } });
    });

    it("displays Location In New Jersey question", () => {
      renderPage({ userData });
      expect(
        screen.getByText(
          markdownToText(Config.profileDefaults.fields.nexusLocationInNewJersey.default.header)
        )
      ).toBeInTheDocument();
    });

    it("sets homeBasedBusiness to false when YES is selected for Location In New Jersey", async () => {
      const { page } = renderPage({ userData });
      page.chooseRadio("location-in-new-jersey-true");
      await page.visitStep(6);
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(false);
      expect(currentUserData().profileData.nexusLocationInNewJersey).toEqual(true);
    });

    it("shows error message banner when Location in New Jersey is not selected", async () => {
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      expect(screen.getByTestId("step-5")).toBeInTheDocument();
      expect(screen.queryByTestId("step-6")).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.nexusLocationInNewJersey.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("banner-alert-REQUIRED_NEXUS_LOCATION_IN_NJ")).toBeInTheDocument();
    });
  });

  describe("validates self-reg step for non-nexus", () => {
    runSelfRegPageTests({ businessPersona: "FOREIGN", selfRegPage: "3" });
  });
});

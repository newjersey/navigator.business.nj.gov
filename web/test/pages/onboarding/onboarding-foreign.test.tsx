import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import { randomHomeBasedIndustry } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
} from "@/test/mock/withStatefulUserData";
import {
  industryIdsWithSingleRequiredEssentialQuestion,
  mockEmptyApiSignups,
  renderPage,
  runNonprofitOnboardingTests,
} from "@/test/pages/onboarding/helpers-onboarding";
import {
  OperatingPhaseId,
  ProfileData,
  emptyIndustrySpecificData,
  generateProfileData,
} from "@businessnjgovnavigator/shared/";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, screen, waitFor } from "@testing-library/react";

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
const { employeesInNJ, transactionsInNJ, revenueInNJ, employeeOrContractorInNJ, none } =
  Config.profileDefaults.fields.foreignBusinessTypeIds.default.optionContent;

const generateTestUserData = (overrides: Partial<ProfileData>): UserData => {
  return generateUserDataForBusiness(
    generateBusiness({
      profileData: generateProfileData(overrides),
      onboardingFormProgress: "UNSTARTED",
    })
  );
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

    it("sets user as Nexus (and displays alert) when employeeOrContractorInNJ checkbox checked", async () => {
      const { page } = renderPage({ userData });
      expect(
        screen.queryByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.NEXUS)
      ).not.toBeInTheDocument();
      page.checkByLabelText(employeeOrContractorInNJ);
      expect(
        screen.getByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.NEXUS)
      ).toBeInTheDocument();

      await page.visitStep(3);
      expect(currentBusiness().profileData.foreignBusinessTypeIds).toEqual(["employeeOrContractorInNJ"]);
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

      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(currentBusiness().profileData.foreignBusinessTypeIds).toEqual(["employeesInNJ"]);
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
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(currentBusiness().profileData.foreignBusinessTypeIds).toEqual(["revenueInNJ"]);
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

      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(currentBusiness().profileData.foreignBusinessTypeIds).toEqual(["transactionsInNJ"]);
    });

    it("prevents user from moving past Step 2 if no foreign business type checked", async () => {
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });

      page.clickNext();
      await waitFor(() => {
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.profileDefaults.fields.foreignBusinessTypeIds.default.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("allows user to move past Step 2 if you have made a selection", async () => {
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.checkByLabelText(transactionsInNJ);
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
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
      page.clickNext();

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
      page.clickNext();
      await waitFor(() => {
        return expect(mockPush).toHaveBeenCalledWith({ pathname: ROUTES.unsupported, query: {} });
      });
    });
  });

  describe("Remote Seller onboarding", () => {
    it("skips the industry, legal structure, and location questions", async () => {
      const userData = generateTestUserData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["revenueInNJ"],
      });

      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
    });

    it("sets operating phase to GUEST_MODE_WITH_BUSINESS_STRUCTURE to prevent prompt", async () => {
      const userData = generateTestUserData({
        operatingPhase: OperatingPhaseId.GUEST_MODE,
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["revenueInNJ"],
      });

      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(currentBusiness().profileData.operatingPhase).toEqual(
        OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE
      );
    });
  });

  describe("REMOTE_WORKER onboarding", () => {
    it("skips the industry, legal structure, and location questions", async () => {
      const userData = generateTestUserData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeesInNJ"],
      });

      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
    });

    it("sets operating phase to GUEST_MODE_WITH_BUSINESS_STRUCTURE to prevent prompt", async () => {
      const userData = generateTestUserData({
        operatingPhase: OperatingPhaseId.GUEST_MODE,
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeesInNJ"],
      });

      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(currentBusiness().profileData.operatingPhase).toEqual(
        OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE
      );
    });
  });

  describe("Nexus - step 3", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateTestUserData({
        industryId: undefined,
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
      });
      useMockRouter({ isReady: true, query: { page: "3" } });
    });

    it("displays step 3", () => {
      renderPage({ userData });
      expect(
        screen.getByText(templateEval(Config.onboardingDefaults.stepXTemplate, { currentPage: "3" }))
      ).toBeInTheDocument();
    });

    it("displays industry question", async () => {
      renderPage({ userData });
      expect(screen.getByLabelText("Industry")).toBeInTheDocument();
    });

    it("sets homeBasedBusiness to false if business is foreign nexus with location in NJ", async () => {
      const userData = generateTestUserData({
        ...emptyIndustrySpecificData,
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
        industryId: randomHomeBasedIndustry(),
        homeBasedBusiness: true,
      });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      fireEvent.change(screen.getByLabelText("Industry"), {
        target: { value: "acupuncture" },
      });
      fireEvent.click(screen.getByText("Acupuncture"));
      page.clickNext();
      await waitFor(() => {
        expect(currentBusiness().profileData.homeBasedBusiness).toBe(false);
      });
    });

    it("prevents user from moving past Step 3 if you have not selected an industry", async () => {
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.clickNext();

      expect(screen.getByTestId("step-3")).toBeInTheDocument();
      expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it.each(industryIdsWithSingleRequiredEssentialQuestion)(
      "prevents user from moving to Step 4 when %s is selected as industry, but essential question is not answered",
      async (industryId) => {
        const userData = generateTestUserData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "3" } });
        const { page } = renderPage({ userData });
        page.clickNext();
        expect(screen.getByTestId("step-3")).toBeInTheDocument();
        expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
        expect(screen.getByTestId("banner-alert-REQUIRED_ESSENTIAL_QUESTION")).toBeInTheDocument();
        expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
      }
    );

    it.each([industryIdsWithSingleRequiredEssentialQuestion])(
      "allows user to move past Step 3 when you have selected an industry %s and answered the essential question",
      async (industryId) => {
        const userData = generateTestUserData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "3" } });
        const { page } = renderPage({ userData });

        page.chooseEssentialQuestionRadio(industryId, 0);
        page.clickNext();

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledTimes(0);
        });
      }
    );

    it.each(industryIdsWithSingleRequiredEssentialQuestion)(
      "removes essential question inline error when essential question radio is selected for %s industry",
      async (industryId) => {
        const userData = generateTestUserData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "3" } });
        const { page } = renderPage({ userData });
        page.clickNext();
        expect(screen.getByTestId("step-3")).toBeInTheDocument();
        expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
        page.chooseEssentialQuestionRadio(industryId, 0);
        expect(screen.queryByText(Config.siteWideErrorMessages.errorRadioButton)).not.toBeInTheDocument();
      }
    );

    const employmentAgencyIndustryId = "employment-agency";

    it("prevents user from moving to Step 4 when employment agency is selected as industry, but essential question is not answered", async () => {
      const userData = generateTestUserData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
        industryId: employmentAgencyIndustryId,
        ...emptyIndustrySpecificData,
      });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.clickNext();
      expect(screen.getByTestId("step-3")).toBeInTheDocument();
      expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(screen.getByTestId("banner-alert-REQUIRED_ESSENTIAL_QUESTION")).toBeInTheDocument();
      expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
    });

    it("allows user to move past Step 3 when you have selected an industry employment agency and answered the essential question", async () => {
      const userData = generateTestUserData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
        industryId: employmentAgencyIndustryId,
        ...emptyIndustrySpecificData,
      });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });

      page.chooseEssentialQuestionRadio(employmentAgencyIndustryId, 1);
      page.clickNext();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(0);
      });
    });

    it("removes essential question inline error when essential question radio is selected for employment agency industry", async () => {
      const userData = generateTestUserData({
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
        industryId: employmentAgencyIndustryId,
        ...emptyIndustrySpecificData,
      });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.clickNext();
      expect(screen.getByTestId("step-3")).toBeInTheDocument();
      expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
      page.chooseEssentialQuestionRadio(employmentAgencyIndustryId, 1);
      expect(screen.queryByText(Config.siteWideErrorMessages.errorRadioButton)).not.toBeInTheDocument();
    });
  });

  describe("Nexus - final step", () => {
    it("keeps operating phase set to GUEST_MODE", async () => {
      const userData = generateTestUserData({
        operatingPhase: OperatingPhaseId.GUEST_MODE,
        businessPersona: "FOREIGN",
        foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
      });

      useMockRouter({ isReady: true, query: { page: "5" } });
      const { page } = renderPage({ userData });
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.GUEST_MODE);
    });
  });

  describe("nonprofit onboarding tests", () => {
    runNonprofitOnboardingTests({ businessPersona: "FOREIGN", industryPage: 3, lastPage: 3 });
  });
});

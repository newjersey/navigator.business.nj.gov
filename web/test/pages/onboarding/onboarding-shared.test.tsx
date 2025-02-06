import { onboardingFlows } from "@/components/onboarding/OnboardingFlows";
import { getMergedConfig } from "@/contexts/configContext";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import * as mockRouter from "@/test/mock/mockRouter";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  getLastCalledWithConfig,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  composeOnBoardingTitle,
  industriesWithOutEssentialQuestion,
  industriesWithSingleEssentialQuestion,
  mockSuccessfulApiSignups,
  renderPage,
} from "@/test/pages/onboarding/helpers-onboarding";
import { arrayOfSectors as sectors } from "@businessnjgovnavigator/shared";
import {
  createEmptyProfileData,
  generateProfileData,
  OperatingPhaseId,
} from "@businessnjgovnavigator/shared/";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { fireEvent, screen, waitFor } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postGetAnnualFilings: jest.fn(),
}));

const Config = getMergedConfig();

describe("onboarding - shared", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    setupStatefulUserDataContext();
    mockSuccessfulApiSignups();
    jest.useFakeTimers();
  });

  it("routes to the dashboard when the user is authenticated and userData is undefined", async () => {
    renderPage({ userData: null });
    expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
  });

  it("routes to the first onboarding question when they have not answered the first question", async () => {
    useMockRouter({ isReady: true, query: { page: "3" } });
    renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it.each(["business-persona-starting", "business-persona-foreign"])(
    "allows %s to move past Step 1",
    async (radioOption: string) => {
      const { page } = renderPage({ userData: undefined });

      page.chooseRadio(radioOption);
      fireEvent.click(screen.getByTestId("next"));
      await waitFor(() => {
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
      });
    }
  );

  it("routes to the second onboarding page when they have answered the first question and we route them to page 2", async () => {
    useMockRouter({ isReady: true, query: { page: "2" } });
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "c-corporation",
      }),
      onboardingFormProgress: "UNSTARTED",
    });

    renderPage({ userData: generateUserDataForBusiness(business) });
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
  });

  it("displays page one when a user goes to /onboarding", async () => {
    mockRouter.mockQuery.mockReturnValue({});
    renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it("pushes to page one when a user visits a page number above the valid page range", async () => {
    useMockRouter({ isReady: true, query: { page: "6" } });
    renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it("pushes to page one when a user visits a page number below the valid page range", async () => {
    useMockRouter({ isReady: true, query: { page: "0" } });
    renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it("autocompletes onboarding and routes to dashboard page when industry WITHOUT essential question is set by using industry query string", async () => {
    const industry = randomElementFromArray(industriesWithOutEssentialQuestion).id;
    useMockRouter({ isReady: true, query: { industry } });
    renderPage({});
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.dashboard,
        query: { [QUERIES.fromOnboarding]: "true" },
      });
    });
    expect(currentBusiness().profileData.businessPersona).toEqual("STARTING");
    expect(currentBusiness().profileData.industryId).toEqual(industry);
    expect(currentBusiness().onboardingFormProgress).toEqual("COMPLETED");
    expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.GUEST_MODE);
  });

  it("autocompletes onboarding and routes to dashboard page when sector question is set by using sector query string", async () => {
    const sector = randomElementFromArray(sectors).id;
    useMockRouter({ isReady: true, query: { sector } });
    renderPage({});
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.dashboard,
        query: { [QUERIES.fromOnboarding]: "true" },
      });
    });
    expect(currentBusiness().profileData.businessPersona).toEqual("OWNING");
    expect(currentBusiness().profileData.sectorId).toEqual(sector);
    expect(currentBusiness().onboardingFormProgress).toEqual("COMPLETED");
    expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.GUEST_MODE_OWNING);
  });

  it("routes to the onboarding industry page when industry WITH essential question is set by using industry query string", async () => {
    const industry = randomElementFromArray(industriesWithSingleEssentialQuestion).id;
    useMockRouter({ isReady: true, query: { industry } });
    const { page } = renderPage({});
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
    page.chooseEssentialQuestionRadio(industry, 0);
    page.clickNext();
    await waitFor(() => {
      expect(currentBusiness().profileData.businessPersona).toEqual("STARTING");
    });
    expect(currentBusiness().profileData.industryId).toEqual(industry);
  });

  it("routes to the first page when using industry query string is invalid", async () => {
    useMockRouter({ isReady: true, query: { industry: "something-nonexistent" } });
    renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it("updates locally for each step", async () => {
    const business = generateBusiness({ profileData: generateProfileData({ businessPersona: "STARTING" }) });
    const { page } = renderPage({ userData: generateUserDataForBusiness(business) });
    const numberOfPages = onboardingFlows.STARTING.pages.length;

    for (let pageNumber = 2; pageNumber < numberOfPages; pageNumber += 1) {
      await page.visitStep(pageNumber);
      expect(getLastCalledWithConfig().local).toEqual(true);
    }
  });

  it("prevents user from moving after Step 1 if you have not selected whether you own a business", async () => {
    const { page } = renderPage({});
    page.clickNext();
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.getByTestId("banner-alert-REQUIRED_EXISTING_BUSINESS")).toBeInTheDocument();
  });

  it("allows user to move past Step 1 if you have selected whether you own a business", async () => {
    const { page } = renderPage({});
    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
  });

  it("is able to go back", async () => {
    const { page } = renderPage({});
    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
    page.clickBack();
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it("resets non-shared information when switching from starting flow to owning flow", async () => {
    const business = generateBusiness({
      onboardingFormProgress: "UNSTARTED",
      profileData: createEmptyProfileData(),
    });
    const { page } = renderPage({ userData: generateUserDataForBusiness(business) });

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    page.selectByValue("Industry", "e-commerce");
    page.clickBack();

    const step = templateEval(Config.onboardingDefaults.stepXTemplate, { currentPage: "1" });

    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.getByTestId("business-persona-owning")).toBeInTheDocument();
    expect(screen.getByText(composeOnBoardingTitle(step))).toBeInTheDocument();
    page.chooseRadio("business-persona-owning");
    page.clickNext();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
    expect(currentBusiness().profileData).toEqual({
      ...business.profileData,
      businessPersona: "OWNING",
      industryId: "generic",
      homeBasedBusiness: undefined,
      legalStructureId: undefined,
      sectorId: "retail-trade-and-ecommerce",
      municipality: undefined,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
    });
  });

  it("does not reset information when re-visiting page 1 but not switching the answer", async () => {
    const business = generateBusiness({
      onboardingFormProgress: "UNSTARTED",
      profileData: createEmptyProfileData(),
    });
    const { page } = renderPage({ userData: generateUserDataForBusiness(business) });

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    page.selectByValue("Industry", "e-commerce");
    page.clickBack();

    await page.visitStep(2);
    expect(currentBusiness().profileData.industryId).toEqual("e-commerce");
  });

  describe("when query parameter sets onboarding flow", () => {
    it("routes user to step 2 when query parameter exists and value is starting", async () => {
      useMockRouter({ isReady: true, query: { flow: "starting" } });
      const { page } = renderPage({});

      expect(screen.getByTestId("step-2")).toBeInTheDocument();
      page.selectByText("Industry", "All Other Businesses");
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      expect(currentBusiness().profileData.businessPersona).toEqual("STARTING");
    });

    it("routes user to step 2 when query parameter exists and value is out-of-state", async () => {
      useMockRouter({ isReady: true, query: { flow: "out-of-state" } });
      const { page } = renderPage({});

      expect(screen.getByTestId("step-2")).toBeInTheDocument();
      const { employeeOrContractorInNJ } =
        Config.profileDefaults.fields.foreignBusinessTypeIds.default.optionContent;

      page.checkByLabelText(employeeOrContractorInNJ);
      await page.visitStep(3);
      expect(currentBusiness().profileData.businessPersona).toEqual("FOREIGN");
    });

    it("routes user to step 1 with up-and-running business selected when up-and-running query parameter exists", async () => {
      useMockRouter({ isReady: true, query: { flow: "up-and-running" } });
      const { page } = renderPage({});

      expect(screen.getByTestId("step-1")).toBeInTheDocument();
      page.selectByValue("Sector", "clean-energy");
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
      expect(currentBusiness().profileData.businessPersona).toEqual("OWNING");
    });
  });
});

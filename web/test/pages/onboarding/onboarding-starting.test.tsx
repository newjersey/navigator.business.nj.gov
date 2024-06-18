import { getMergedConfig } from "@/contexts/configContext";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import * as mockRouter from "@/test/mock/mockRouter";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  currentUserData,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  industryIdsWithSingleRequiredEssentialQuestion,
  mockSuccessfulApiSignups,
  renderPage,
  runNonprofitOnboardingTests,
} from "@/test/pages/onboarding/helpers-onboarding";
import {
  LookupIndustryById,
  ProfileData,
  UserData,
  createEmptyUser,
  createEmptyUserData,
  generateMunicipality,
  generateProfileData,
  generateUserData,
} from "@businessnjgovnavigator/shared/";
import { emptyIndustrySpecificData } from "@businessnjgovnavigator/shared/profileData";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { act, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postGetAnnualFilings: jest.fn(),
}));

const Config = getMergedConfig();

const generateTestUserData = (overrides: Partial<ProfileData>): UserData => {
  return generateUserDataForBusiness(
    generateBusiness({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        ...overrides,
      }),
      onboardingFormProgress: "UNSTARTED",
    })
  );
};

describe("onboarding - starting a business", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    setupStatefulUserDataContext();
    mockSuccessfulApiSignups();
    jest.useFakeTimers();
  });

  describe("page 2", () => {
    it("prevents user from moving after Step 2 if you have not selected an industry", async () => {
      const userData = generateTestUserData({ industryId: undefined });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.clickNext();
      expect(screen.getByTestId("step-2")).toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 2 if you have selected an industry", async () => {
      const userData = generateTestUserData({ industryId: undefined });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.selectByText("Industry", "All Other Businesses");
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: ROUTES.dashboard,
          query: { [QUERIES.fromOnboarding]: "true" },
        });
      });
    });

    it.each(industryIdsWithSingleRequiredEssentialQuestion)(
      "prevents user from moving to Step 3 when %s is selected as industry, but essential question is not answered",
      async (industryId) => {
        const userData = generateTestUserData({
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { page } = renderPage({ userData });

        page.clickNext();
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
        expect(screen.getByTestId("banner-alert-REQUIRED_ESSENTIAL_QUESTION")).toBeInTheDocument();
        expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
      }
    );

    it.each(industryIdsWithSingleRequiredEssentialQuestion)(
      "allows user to move past Step 2 when you have selected an industry %s and answered the essential question",
      async (industryId) => {
        const userData = generateTestUserData({
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { page } = renderPage({ userData });

        page.chooseEssentialQuestionRadio(industryId, 0);
        page.clickNext();
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith({
            pathname: ROUTES.dashboard,
            query: { [QUERIES.fromOnboarding]: "true" },
          });
        });
      }
    );

    it.each(industryIdsWithSingleRequiredEssentialQuestion)(
      "removes essential question inline error when essential question radio is selected for %s industry",
      async (industryId) => {
        const userData = generateTestUserData({
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { page } = renderPage({ userData });

        page.clickNext();
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
        expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
        page.chooseEssentialQuestionRadio(industryId, 0);
        expect(screen.queryByText(Config.siteWideErrorMessages.errorRadioButton)).not.toBeInTheDocument();
      }
    );

    const employmentAgencyIndustryId = "employment-agency";

    it("prevents user from moving to Step 3 when employment agency is selected as industry, but essential question is not answered", async () => {
      const userData = generateTestUserData({
        industryId: employmentAgencyIndustryId,
        ...emptyIndustrySpecificData,
      });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });

      page.clickNext();
      expect(screen.getByTestId("step-2")).toBeInTheDocument();
      expect(screen.getByTestId("banner-alert-REQUIRED_ESSENTIAL_QUESTION")).toBeInTheDocument();
      expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
    });

    it("allows user to move past Step 2 when you have selected an industry employment agency and answered the essential question", async () => {
      const userData = generateTestUserData({
        industryId: employmentAgencyIndustryId,
        ...emptyIndustrySpecificData,
      });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });

      page.chooseEssentialQuestionRadio(employmentAgencyIndustryId, 1);
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: ROUTES.dashboard,
          query: { [QUERIES.fromOnboarding]: "true" },
        });
      });
    });

    it("removes essential question inline error when essential question radio is selected for employment agency industry", async () => {
      const userData = generateTestUserData({
        industryId: employmentAgencyIndustryId,
        ...emptyIndustrySpecificData,
      });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });

      page.clickNext();
      expect(screen.getByTestId("step-2")).toBeInTheDocument();
      expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
      page.chooseEssentialQuestionRadio(employmentAgencyIndustryId, 1);
      expect(screen.queryByText(Config.siteWideErrorMessages.errorRadioButton)).not.toBeInTheDocument();
    });
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    const { page } = renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    page.chooseRadio("business-persona-starting");

    await page.visitStep(2);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
  });

  it("shows correct next-button text on each page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("business-persona-starting");
    const page1 = within(screen.getByTestId("page-1-form"));
    expect(page1.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page1.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep(2);
    const page2 = within(screen.getByTestId("page-2-form"));
    expect(page2.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page2.getByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      currentBusinessId: "12345",
      businesses: {
        "12345": generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            businessName: "Applebees",
            industryId: "cosmetology",
          }),
        }),
      },
    });

    const { page } = renderPage({ userData });
    expect(
      page.getRadioButton(Config.profileDefaults.fields.businessPersona.default.radioButtonStartingText)
    ).toBeChecked();

    await page.visitStep(2);
    expect(page.getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(createEmptyUser());
    const businessId = initialUserData.currentBusinessId;
    const { page } = renderPage({ userData: initialUserData });

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    expect(currentBusiness().profileData.businessPersona).toEqual("STARTING");

    page.selectByValue("Industry", "e-commerce");
    page.clickNext();

    const expectedUserData: UserData = {
      ...initialUserData,
      businesses: {
        [businessId]: {
          ...initialUserData.businesses[businessId],
          onboardingFormProgress: "COMPLETED",
          profileData: {
            ...initialUserData.businesses[businessId].profileData,
            businessPersona: "STARTING",
            businessName: "",
            industryId: "e-commerce",
            sectorId: "retail-trade-and-ecommerce",
            homeBasedBusiness: undefined,
            municipality: undefined,
            isNonprofitOnboardingRadio: false,
          },
          preferences: {
            ...initialUserData.businesses[businessId].preferences,
            visibleSidebarCards: [],
          },
        },
      },
    };

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.dashboard,
        query: { [QUERIES.fromOnboarding]: "true" },
      });
    });

    expect(currentUserData()).toEqual(expectedUserData);
  });

  it("removes required fields error when user goes back", async () => {
    const { page } = renderPage({});
    page.chooseRadio("business-persona-foreign");
    await page.visitStep(2);
    act(() => {
      return page.clickNext();
    });
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
    expect(screen.getByTestId("banner-alert-REQUIRED_FOREIGN_BUSINESS_TYPE")).toBeInTheDocument();
    page.clickBack();
    expect(screen.queryByTestId("banner-alert-REQUIRED_FOREIGN_BUSINESS_TYPE")).not.toBeInTheDocument();
  });

  describe("nonprofit onboarding tests", () => {
    runNonprofitOnboardingTests({ businessPersona: "STARTING", industryPage: 2, lastPage: 2 });
  });
});

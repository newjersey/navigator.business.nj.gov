import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import * as mockRouter from "@/test/mock/mockRouter";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  currentUserData,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  industryIdsWithRequiredEssentialQuestion,
  mockSuccessfulApiSignups,
  renderPage,
  runNonprofitOnboardingTests,
  runSelfRegPageTests,
} from "@/test/pages/onboarding/helpers-onboarding";
import {
  createEmptyUser,
  createEmptyUserData,
  generateMunicipality,
  generateProfileData,
  generateUser,
  generateUserData,
  LookupIndustryById,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { emptyIndustrySpecificData } from "@businessnjgovnavigator/shared/profileData";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { act, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
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
      act(() => {
        return page.clickNext();
      });
      expect(screen.getByTestId("step-2")).toBeInTheDocument();
      expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 2 if you have selected an industry", async () => {
      const userData = generateTestUserData({ industryId: undefined });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.selectByText("Industry", "All Other Businesses");
      await page.visitStep(3);
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
    });

    it.each(industryIdsWithRequiredEssentialQuestion)(
      "prevents user from moving to Step 3 when %s is selected as industry, but essential question is not answered",
      async (industryId) => {
        const userData = generateTestUserData({
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { page } = renderPage({ userData });

        act(() => {
          page.clickNext();
        });
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
        expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
        expect(screen.getByTestId("banner-alert-REQUIRED_ESSENTIAL_QUESTION")).toBeInTheDocument();
        expect(
          screen.getAllByText(Config.profileDefaults.default.essentialQuestionInlineText)[0]
        ).toBeInTheDocument();
      }
    );

    it.each(industryIdsWithRequiredEssentialQuestion)(
      "allows user to move past Step 2 when you have selected an industry %s and answered the essential question",
      async (industryId) => {
        const userData = generateTestUserData({
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { page } = renderPage({ userData });

        page.chooseEssentialQuestionRadio(industryId, 0);
        await page.visitStep(3);
        expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
      }
    );

    it.each(industryIdsWithRequiredEssentialQuestion)(
      "removes essential question inline error when essential question radio is selected for %s industry",
      async (industryId) => {
        const userData = generateTestUserData({
          industryId: industryId,
          ...emptyIndustrySpecificData,
        });
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { page } = renderPage({ userData });

        act(() => {
          page.clickNext();
        });
        expect(screen.getByTestId("step-2")).toBeInTheDocument();
        expect(
          screen.getAllByText(Config.profileDefaults.default.essentialQuestionInlineText)[0]
        ).toBeInTheDocument();
        page.chooseEssentialQuestionRadio(industryId, 0);
        expect(
          screen.queryByText(Config.profileDefaults.default.essentialQuestionInlineText)
        ).not.toBeInTheDocument();
      }
    );
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    const { page } = renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    page.chooseRadio("business-persona-starting");

    await page.visitStep(2);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
    page.selectByText("Industry", "All Other Businesses");

    await page.visitStep(3);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-3")).toBeInTheDocument();
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
    expect(page2.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page2.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.selectByText("Industry", "All Other Businesses");

    await page.visitStep(3);
    const page3 = within(screen.getByTestId("page-3-form"));
    expect(page3.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page3.getByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
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
      user: generateUser({
        name: "Michael Deeb",
        email: "mdeeb@example.com",
      }),
    });

    const { page } = renderPage({ userData });
    expect(page.getRadioButton("Business Status - Starting")).toBeChecked();

    await page.visitStep(2);
    expect(page.getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);

    await page.visitStep(3);
    expect(page.getFullNameValue()).toEqual("Michael Deeb");
    expect(page.getEmailValue()).toEqual("mdeeb@example.com");
    expect(page.getConfirmEmailValue()).toEqual("mdeeb@example.com");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(createEmptyUser());
    const businessId = initialUserData.currentBusinessId;
    const { page } = renderPage({ userData: initialUserData });

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    expect(currentBusiness().profileData.businessPersona).toEqual("STARTING");

    page.selectByValue("Industry", "e-commerce");
    await page.visitStep(3);
    expect(currentBusiness().profileData.industryId).toEqual("e-commerce");

    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
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
            visibleSidebarCards: ["welcome"],
          },
        },
      },
      user: {
        ...initialUserData.user,
        name: "My Name",
        email: "email@example.com",
      },
    };

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.dashboard,
        query: { [QUERIES.fromOnboarding]: "true" },
      });
    });

    expect(mockApi.postNewsletter).toHaveBeenCalledWith({
      ...expectedUserData,
      user: { ...expectedUserData.user, externalStatus: {} },
    });
    expect(mockApi.postUserTesting).toHaveBeenCalledWith({
      ...expectedUserData,
      user: {
        ...expectedUserData.user,
        externalStatus: { newsletter: { status: "SUCCESS", success: true } },
      },
    });

    expect(currentUserData()).toEqual({
      ...expectedUserData,
      businesses: {
        [businessId]: {
          ...expectedUserData.businesses[businessId],
          preferences: {
            ...expectedUserData.businesses[businessId].preferences,
            visibleSidebarCards: ["welcome", "task-progress"],
          },
        },
      },
      user: {
        ...expectedUserData.user,
        externalStatus: {
          newsletter: { status: "SUCCESS", success: true },
          userTesting: { status: "SUCCESS", success: true },
        },
      },
    });
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

  describe("validates self-reg step", () => {
    runSelfRegPageTests({ businessPersona: "STARTING", selfRegPage: "3" });
  });

  describe("nonprofit onboarding tests", () => {
    runNonprofitOnboardingTests({ businessPersona: "STARTING", industryPage: 2, selfRegPage: 3 });
  });
});

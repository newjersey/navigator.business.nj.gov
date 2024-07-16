import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { templateEval } from "@/lib/utils/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { currentBusiness, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  composeOnBoardingTitle,
  mockEmptyApiSignups,
  renderPage,
} from "@/test/pages/onboarding/helpers-onboarding";
import {
  OperatingPhaseId,
  ProfileData,
  createEmptyUserData,
  generateMunicipality,
  generateProfileData,
  generateTaxFilingData,
} from "@businessnjgovnavigator/shared/";
import {
  generateBusiness,
  generateUser,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();

const generateTestUserData = (overrides: Partial<ProfileData>): UserData => {
  return generateUserDataForBusiness(
    generateBusiness({
      profileData: generateProfileData({
        businessPersona: "OWNING",
        operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
        ...overrides,
      }),
      onboardingFormProgress: "UNSTARTED",
    })
  );
};

describe("onboarding - owning a business", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    setupStatefulUserDataContext();
    mockEmptyApiSignups();
    jest.useFakeTimers();
  });

  describe("page 1", () => {
    it("uses standard template eval for step label", () => {
      renderPage({});
      const step = templateEval(Config.onboardingDefaults.stepXTemplate, { currentPage: "1" });

      expect(screen.getByText(composeOnBoardingTitle(step))).toBeInTheDocument();
    });

    it("displays the sector dropdown after radio selected", () => {
      const { page } = renderPage({});
      expect(screen.queryByLabelText("Sector")).not.toBeInTheDocument();
      page.chooseRadio("business-persona-owning");
      expect(screen.getByLabelText("Sector")).toBeInTheDocument();
    });

    it("does not allow OWNING user persona to move past Step 1 if user has not entered a sector", async () => {
      const { page } = renderPage({ userData: undefined });
      page.chooseRadio("business-persona-owning");
      fireEvent.click(screen.getByTestId("next"));
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
        ).toBeInTheDocument();
      });
      expect(screen.getByTestId("banner-alert-REQUIRED_REVIEW_INFO_BELOW")).toBeInTheDocument();
      expect(screen.getByTestId("step-1")).toBeInTheDocument();
    });

    it("updates operating phase when user changes their business persona", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.GUEST_MODE,
        }),
      });

      const { page } = renderPage({ userData: generateUserDataForBusiness(business) });
      page.chooseRadio("business-persona-owning");
      page.chooseRadio("business-persona-starting");
      page.clickNext();
      await waitFor(() => {
        expect(currentBusiness().profileData.operatingPhase).toBe(OperatingPhaseId.GUEST_MODE);
      });
    });

    it("allows user to move past Step 1 if you have entered a sector", async () => {
      const userData = generateTestUserData({ sectorId: undefined });
      useMockRouter({ isReady: true, query: { page: "1" } });
      const { page } = renderPage({ userData });
      page.selectByValue("Sector", "clean-energy");
      page.clickNext();
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      expect(
        screen.queryByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
    });
  });

  it("shows correct next-button text on page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("business-persona-owning");
    page.selectByValue("Sector", "clean-energy");
    const page1 = within(screen.getByTestId("page-1-form"));
    expect(page1.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page1.getByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const initialBusiness = initialUserData.businesses[initialUserData.currentBusinessId];
    const { page } = renderPage({ userData: initialUserData });

    page.chooseRadio("business-persona-owning");
    page.selectByValue("Sector", "clean-energy");
    page.clickNext();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });

    expect(currentBusiness()).toEqual({
      ...initialBusiness,
      onboardingFormProgress: "COMPLETED",
      profileData: {
        ...initialBusiness.profileData,
        businessPersona: "OWNING",
        homeBasedBusiness: undefined,
        legalStructureId: undefined,
        sectorId: "clean-energy",
        industryId: "generic",
        operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
      },
      preferences: {
        ...initialBusiness.preferences,
        visibleSidebarCards: [],
      },
    });
  });

  it("prefills form from existing user data", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "OWNING",
        sectorId: "clean-energy",
      }),
    });

    const { page } = renderPage({ userData: generateUserDataForBusiness(business) });
    expect(
      page.getRadioButton(Config.profileDefaults.fields.businessPersona.default.radioButtonOwningText)
    ).toBeChecked();
    expect(page.getSectorIDValue()).toEqual("Clean Energy");
  });

  it("updates tax filing data on save", async () => {
    const taxData = generateTaxFilingData({});

    mockApi.postGetAnnualFilings.mockImplementation((userData): Promise<UserData> => {
      return Promise.resolve({
        ...userData,
        businesses: {
          [userData.currentBusinessId]: {
            ...userData.businesses[userData.currentBusinessId],
            taxFilingData: { ...taxData, filings: [] },
          },
        },
      });
    });

    const initialBusiness = generateBusiness({
      taxFilingData: taxData,
      profileData: generateProfileData({
        businessPersona: "OWNING",
        legalStructureId: undefined,
      }),
      onboardingFormProgress: "COMPLETED",
    });

    const { page } = renderPage({ userData: generateUserDataForBusiness(initialBusiness) });
    expect(
      page.getRadioButton(Config.profileDefaults.fields.businessPersona.default.radioButtonOwningText)
    ).toBeChecked();
    page.clickNext();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(currentBusiness()).toEqual({
        ...initialBusiness,
        taxFilingData: { ...taxData, filings: [] },
      });
    });
  });
});

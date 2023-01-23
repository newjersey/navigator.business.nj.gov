import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
  randomLegalStructure,
} from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  mockEmptyApiSignups,
  renderPage,
  runSelfRegPageTests,
} from "@/test/pages/onboarding/helpers-onboarding";
import { createEmptyUserData, generateMunicipality, ProfileData } from "@businessnjgovnavigator/shared/";
import { act, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();

const generateTestUserData = (overrides: Partial<ProfileData>) => {
  return generateUserData({
    profileData: generateProfileData({
      ...overrides,
    }),
    formProgress: "UNSTARTED",
  });
};

const generateCCorpTestUserData = (overrides: Partial<ProfileData>) => {
  return generateTestUserData({
    businessPersona: "OWNING",
    legalStructureId: "c-corporation",
    ...overrides,
  });
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
    it("uses special template eval for step 1 label", () => {
      renderPage({});
      expect(
        screen.getByText(templateEval(Config.onboardingDefaults.stepXTemplate, { currentPage: "1" }))
      ).toBeInTheDocument();
    });

    it("uses standard template eval for step 2 label", () => {
      const userData = generateTestUserData({
        businessPersona: "OWNING",
        legalStructureId: "sole-proprietorship",
      });
      useMockRouter({ isReady: true, query: { page: "2" } });
      renderPage({ userData });
      expect(
        screen.getByText(
          templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "2", totalPages: "2" })
        )
      ).toBeInTheDocument();
    });

    it("displays the sector and legal structure dropdowns after radio selected", () => {
      const { page } = renderPage({});
      expect(screen.queryByLabelText("Sector")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Business structure")).not.toBeInTheDocument();
      page.chooseRadio("business-persona-owning");
      expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
      expect(screen.getByLabelText("Sector")).toBeInTheDocument();
    });

    it("prevents user from moving after Step 1 if you have not entered a legal structure and have not entered a sector", async () => {
      const userData = generateCCorpTestUserData({ legalStructureId: undefined, sectorId: undefined });
      useMockRouter({ isReady: true, query: { page: "1" } });
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      await waitFor(() => {
        expect(screen.getByTestId("step-1")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.legalStructureId.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("banner-alert-REQUIRED_REVIEW_INFO_BELOW")).toBeInTheDocument();
    });

    it("prevents user from moving after Step 1 if you have not entered a legal structure and have entered a sector", async () => {
      const userData = generateCCorpTestUserData({ legalStructureId: undefined });
      useMockRouter({ isReady: true, query: { page: "1" } });
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      await waitFor(() => {
        expect(screen.getByTestId("step-1")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.legalStructureId.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("banner-alert-REQUIRED_REVIEW_INFO_BELOW")).toBeInTheDocument();
    });

    it("prevents user from moving after Step 1 if you have not entered a sector but have entered a legal structure", async () => {
      const userData = generateCCorpTestUserData({ sectorId: undefined });
      useMockRouter({ isReady: true, query: { page: "1" } });
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      await waitFor(() => {
        expect(screen.getByTestId("step-1")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("banner-alert-REQUIRED_REVIEW_INFO_BELOW")).toBeInTheDocument();
    });

    it("allows user to move past Step 1 if you have entered a sector and a legal structure", async () => {
      const userData = generateCCorpTestUserData({ legalStructureId: undefined, sectorId: undefined });
      useMockRouter({ isReady: true, query: { page: "1" } });
      const { page } = renderPage({ userData });
      page.selectByValue("Business structure", randomLegalStructure().id);
      page.selectByValue("Sector", "clean-energy");
      await page.visitStep(2);

      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
        ).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults.fields.legalStructureId.default.errorTextRequired)
        ).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
      expect(screen.queryByTestId("step-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("step-2")).toBeInTheDocument();
    });
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });

    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "c-corporation");
    page.selectByValue("Sector", "clean-energy");
    expect(screen.getByTestId("step-1")).toBeInTheDocument();

    await page.visitStep(2);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
  });

  it("shows correct next-button text on each page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "sole-proprietorship");
    page.selectByValue("Sector", "clean-energy");
    const page1 = within(screen.getByTestId("page-1-form"));
    expect(page1.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page1.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep(2);
    const page2 = within(screen.getByTestId("page-2-form"));
    expect(page2.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page2.getByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const { page } = renderPage({ userData: initialUserData });

    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "c-corporation");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep(2);

    expect(currentUserData()).toEqual({
      ...initialUserData,
      formProgress: "UNSTARTED",
      profileData: {
        ...initialUserData.profileData,
        businessPersona: "OWNING",
        homeBasedBusiness: undefined,
        legalStructureId: "c-corporation",
        sectorId: "clean-energy",
        industryId: "generic",
        operatingPhase: "GUEST_MODE_OWNING",
      },
      preferences: {
        ...initialUserData.preferences,
        visibleSidebarCards: ["welcome"],
      },
    });
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "OWNING",
        legalStructureId: "c-corporation",
        sectorId: "clean-energy",
      }),
    });

    const { page } = renderPage({ userData });
    expect(page.getRadioButton("Business Status - Owning")).toBeChecked();

    expect(page.getLegalStructureValue()).toEqual("c-corporation");
    expect(page.getSectorIDValue()).toEqual("Clean Energy");
  });

  it("updates tax filing data on save", async () => {
    const taxData = generateTaxFilingData({});
    mockApi.postGetAnnualFilings.mockImplementation((userData) => {
      return Promise.resolve({ ...userData, taxFilingData: { ...taxData, filings: [] } });
    });
    const initialUserData = generateUserData({
      taxFilingData: taxData,
      profileData: generateProfileData({
        legalStructureId: "c-corporation",
        businessPersona: "OWNING",
      }),
    });
    const { page } = renderPage({ userData: initialUserData });
    expect(page.getRadioButton("Business Status - Owning")).toBeChecked();
    await page.visitStep(2);
    page.clickNext();

    await waitFor(() => {
      expect(currentUserData()).toEqual({
        ...initialUserData,
        taxFilingData: { ...taxData, filings: [] },
      });
    });
  });

  describe("validates self-reg step", () => {
    runSelfRegPageTests({ businessPersona: "OWNING", selfRegPage: "2" });
  });
});

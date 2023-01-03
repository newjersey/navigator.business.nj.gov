import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { templateEval } from "@/lib/utils/helpers";
import { generateProfileData, generateTaxFilingData, generateUser, generateUserData } from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  mockEmptyApiSignups,
  renderPage,
  runSelfRegPageTests,
} from "@/test/pages/onboarding/helpers-onboarding";
import {
  createEmptyUserData,
  defaultDateFormat,
  generateMunicipality,
  getCurrentDate,
  ProfileData,
} from "@businessnjgovnavigator/shared/";
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

const date = getCurrentDate().subtract(1, "month").date(1);
const dateOfFormation = date.format(defaultDateFormat);
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
    ...overrides,
    businessPersona: "OWNING",
    legalStructureId: "c-corporation",
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
          templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "2", totalPages: "4" })
        )
      ).toBeInTheDocument();
    });

    it("displays the legal structure dropdown after radio selected", () => {
      const { page } = renderPage({});
      expect(screen.queryByLabelText("Business structure")).not.toBeInTheDocument();
      page.chooseRadio("business-persona-owning");
      expect(screen.getByLabelText("Business structure")).toBeInTheDocument();
    });
  });

  describe("page 2", () => {
    it("skips date-of-formation page if legal structure  does not require Public Filing", () => {
      const userData = generateTestUserData({
        businessPersona: "OWNING",
        legalStructureId: "sole-proprietorship",
      });
      useMockRouter({ isReady: true, query: { page: "2" } });
      renderPage({ userData });
      expect(screen.queryByLabelText("Date of formation")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Business name")).toBeInTheDocument();

      expect(
        screen.getByText(
          templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "2", totalPages: "4" })
        )
      ).toBeInTheDocument();
    });
  });

  describe("page 3", () => {
    it("prevents user from moving after Step 3 if you have not entered a business name", async () => {
      const userData = generateCCorpTestUserData({ businessName: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      await waitFor(() => {
        expect(screen.getByTestId("step-3")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 3 if you have entered a business name", async () => {
      const userData = generateCCorpTestUserData({ businessName: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.fillText("Business name", "A business");
      await page.visitStep(4);

      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
        ).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
      expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
    });

    it("prevents user from moving after Step 3 if you have not entered a sector", async () => {
      const userData = generateCCorpTestUserData({ sectorId: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      await waitFor(() => {
        expect(screen.getByTestId("step-3")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 3 if you have entered a sector", async () => {
      const userData = generateCCorpTestUserData({ sectorId: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.selectByValue("Sector", "clean-energy");
      await page.visitStep(4);

      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
        ).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
      expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
    });
  });

  describe("page 4", () => {
    it("prevents user from moving after Step 4 if you have not selected a location", async () => {
      const userData = generateCCorpTestUserData({ municipality: undefined });
      useMockRouter({ isReady: true, query: { page: "4" } });
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({ municipalities: [newark], userData });
      act(() => {
        return page.clickNext();
      });
      await waitFor(() => {
        expect(screen.getByTestId("step-4")).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 4 if you have selected a location", async () => {
      const userData = generateCCorpTestUserData({ municipality: undefined });
      useMockRouter({ isReady: true, query: { page: "4" } });
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({ municipalities: [newark], userData });
      page.selectByText("Location", "Newark");
      await page.visitStep(5);
      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
        ).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
    });

    it("prevents user from moving after Step 4 if you have not entered number of employees", async () => {
      const userData = generateCCorpTestUserData({ existingEmployees: undefined, municipality: undefined });
      useMockRouter({ isReady: true, query: { page: "4" } });
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({
        municipalities: [newark],
        userData,
      });
      expect(screen.getByTestId("step-4")).toBeInTheDocument();
      page.selectByText("Location", "Newark");
      act(() => {
        return page.clickNext();
      });

      await waitFor(() => {
        screen.getByText(Config.profileDefaults.fields.existingEmployees.default.errorTextRequired);
      });
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 4 if you have entered number of employees", async () => {
      const userData = generateCCorpTestUserData({ existingEmployees: undefined, municipality: undefined });
      useMockRouter({ isReady: true, query: { page: "4" } });
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({
        municipalities: [newark],
        userData,
      });
      expect(screen.getByTestId("step-4")).toBeInTheDocument();
      page.fillText("Existing employees", "123");
      page.selectByText("Location", "Newark");
      await page.visitStep(5);

      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults.fields.existingEmployees.default.errorTextRequired)
        ).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
      expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
    });
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });

    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "c-corporation");
    expect(screen.getByTestId("step-1")).toBeInTheDocument();

    await page.visitStep(2);
    page.selectDate("Date of formation", date);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-2")).toBeInTheDocument();

    await page.visitStep(3);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-3")).toBeInTheDocument();

    await page.visitStep(4);
    page.selectByText("Location", "Newark");
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 4 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-4")).toBeInTheDocument();
  });

  it("shows correct next-button text on each page if user requires legal filings", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "c-corporation");
    const page1 = within(screen.getByTestId("page-1-form"));
    expect(page1.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page1.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep(2);
    page.selectDate("Date of formation", date);
    const page2 = within(screen.getByTestId("page-2-form"));
    expect(page2.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page2.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep(3);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    const page3 = within(screen.getByTestId("page-3-form"));
    expect(page3.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page3.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep(4);
    const page4 = within(screen.getByTestId("page-4-form"));
    expect(page4.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page4.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.fillText("Existing employees", "1234567");
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");
    page.selectByValue("Ownership", "disabled-veteran");
    await page.visitStep(5);
    const page5 = within(screen.getByTestId("page-5-form"));
    expect(page5.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page5.getByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
  });

  it("shows correct next-button text on each page if legal structure  does not require Public Filing", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "sole-proprietorship");
    const page1 = within(screen.getByTestId("page-1-form"));
    expect(page1.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page1.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep(2);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    const page2 = within(screen.getByTestId("page-2-form"));
    expect(page2.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page2.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep(3);
    const page3 = within(screen.getByTestId("page-3-form"));
    expect(page3.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page3.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.fillText("Existing employees", "1234567");
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");
    page.selectByValue("Ownership", "disabled-veteran");
    await page.visitStep(4);
    const page4 = within(screen.getByTestId("page-4-form"));
    expect(page4.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page4.getByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ userData: initialUserData, municipalities: [newark] });

    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "c-corporation");
    await page.visitStep(2);
    expect(currentUserData().profileData.businessPersona).toEqual("OWNING");
    page.selectDate("Date of formation", date);
    await page.visitStep(3);
    expect(currentUserData().profileData.dateOfFormation).toEqual(dateOfFormation);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep(4);
    page.fillText("Existing employees", "1234567");
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");
    page.selectByValue("Ownership", "disabled-veteran");
    await page.visitStep(5);
    expect(currentUserData()).toEqual({
      ...initialUserData,
      formProgress: "UNSTARTED",
      profileData: {
        ...initialUserData.profileData,
        businessPersona: "OWNING",
        businessName: "Cool Computers",
        homeBasedBusiness: undefined,
        legalStructureId: "c-corporation",
        dateOfFormation,
        municipality: newark,
        ownershipTypeIds: ["veteran-owned", "disabled-veteran"],
        existingEmployees: "1234567",
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
        dateOfFormation,
        businessName: "Applebees",
        municipality: generateMunicipality({
          displayName: "Newark",
        }),
        sectorId: "clean-energy",
      }),
    });

    const { page } = renderPage({ userData });
    expect(page.getRadioButton("Business Status - Owning")).toBeChecked();

    expect(page.getLegalStructureValue()).toEqual("c-corporation");
    await page.visitStep(2);
    expect(page.getDateOfFormationValue()).toEqual(date.format("MM/YYYY"));
    await page.visitStep(3);
    expect(page.getBusinessNameValue()).toEqual("Applebees");
    expect(page.getSectorIDValue()).toEqual("Clean Energy");
    await page.visitStep(4);
    expect(page.getMunicipalityValue()).toEqual("Newark");
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
    await page.visitStep(3);
    await page.visitStep(4);
    await page.visitStep(5);
    page.clickNext();

    await waitFor(() => {
      expect(currentUserData()).toEqual({
        ...initialUserData,
        taxFilingData: { ...taxData, filings: [] },
      });
    });
  });

  describe("validates self-reg step for legal structures that require public filing", () => {
    runSelfRegPageTests({ businessPersona: "OWNING", requiresPublicFiling: true, selfRegPage: "5" });
  });

  describe("validates self-reg step for legal structures that do not require public filing", () => {
    runSelfRegPageTests({ businessPersona: "OWNING", requiresPublicFiling: false, selfRegPage: "4" });
  });
});

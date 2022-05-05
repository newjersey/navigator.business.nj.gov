import * as api from "@/lib/api-client/apiClient";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateMunicipality,
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import { PageHelpers, renderPage, runSelfRegPageTests } from "@/test/pages/onboarding/helpers-onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyUserData, getCurrentDate, ProfileData } from "@businessnjgovnavigator/shared/";
import { act, fireEvent, waitFor, within } from "@testing-library/react";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

const date = getCurrentDate().subtract(1, "month").date(1);
const dateOfFormation = date.format("YYYY-MM-DD");
const generateTestUserData = (overrides: Partial<ProfileData>) =>
  generateUserData({
    profileData: generateProfileData({
      ...overrides,
    }),
    formProgress: "UNSTARTED",
  });

const generateCCorpTestUserData = (overrides: Partial<ProfileData>) =>
  generateTestUserData({
    ...overrides,
    hasExistingBusiness: true,
    legalStructureId: "c-corporation",
  });

describe("onboarding - owning a business", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    setupStatefulUserDataContext();
    mockApi.postGetAnnualFilings.mockImplementation((request) => Promise.resolve(request));
    mockApi.postNewsletter.mockImplementation((request) => Promise.resolve(request));
    mockApi.postUserTesting.mockImplementation((request) => Promise.resolve(request));
  });

  describe("page 1", () => {
    it("uses special template eval for step 1 label", async () => {
      act(async () => {
        const { subject, page } = renderPage({});
        expect(
          subject.getByText(templateEval(Config.onboardingDefaults.stepOneTemplate, { currentPage: "1" }))
        ).toBeInTheDocument();
        page.chooseRadio("has-existing-business-true");
        page.selectByValue("Legal structure", "c-corporation");
        await page.visitStep2();
        expect(
          subject.getByText(
            templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "2", totalPages: "5" })
          )
        ).toBeInTheDocument();
      });
    });

    it("displays the legal structure dropdown", async () => {
      act(async () => {
        const { subject, page } = renderPage({});
        page.chooseRadio("has-existing-business-true");
        expect(subject.getByLabelText("Legal structure")).toBeInTheDocument();
      });
    });

    it("prevents user from moving after Step 1 if you have not selected whether you own a business", async () => {
      act(async () => {
        const { subject, page } = renderPage({});
        page.clickNext();
        expect(subject.getByTestId("step-1")).toBeInTheDocument();
        expect(subject.queryByTestId("step-2")).not.toBeInTheDocument();
        expect(subject.getByTestId("error-alert-REQUIRED_EXISTING_BUSINESS")).toBeInTheDocument();
      });
    });

    it("allows user to move from Step 1 if you have selected whether you own a business", async () => {
      act(async () => {
        const { subject, page } = renderPage({});
        page.chooseRadio("has-existing-business-true");
        page.selectByValue("Legal structure", "c-corporation");
        await page.visitStep2();
        expect(subject.queryByTestId("error-alert-REQUIRED_EXISTING_BUSINESS")).not.toBeInTheDocument();
        expect(subject.queryByTestId("step-2")).toBeInTheDocument();
      });
    });
  });

  describe("page 2", () => {
    it("hides date of formation and entity id if legal structure  does not require Public Filing", async () => {
      act(async () => {
        const userData = generateTestUserData({
          hasExistingBusiness: true,
          legalStructureId: "sole-proprietorship",
        });
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { subject } = renderPage({ userData });
        expect(subject.queryByLabelText("Date of formation")).not.toBeInTheDocument();
        expect(subject.queryByLabelText("Entity id")).not.toBeInTheDocument();
        expect(subject.getByLabelText("Business name")).toBeInTheDocument();
      });
    });

    it("prevents user from moving past Step 2 if your entity id is invalid", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({});
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { subject, page } = renderPage({ userData });

        page.selectDate("Date of formation", date);
        page.fillText("Entity id", "123");
        fireEvent.blur(subject.getByLabelText("Entity id"));
        page.clickNext();

        await waitFor(() => {
          expect(subject.getByTestId("step-2")).toBeInTheDocument();
          expect(subject.queryByTestId("step-3")).not.toBeInTheDocument();
          expect(
            subject.getByText(
              templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, { length: "10" })
            )
          ).toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
        });
      });
    });

    it("allows user to move past Step 2 if your entity id is valid", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({});
        useMockRouter({ isReady: true, query: { page: "2" } });
        const { subject, page } = renderPage({ userData });
        page.fillText("Entity id", "1234567890");
        await page.visitStep3();

        await waitFor(() => {
          expect(
            subject.queryByText(
              templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, { length: "10" })
            )
          ).not.toBeInTheDocument();
          expect(subject.getByTestId("step-3")).toBeInTheDocument();
          expect(subject.queryByTestId("step-2")).not.toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("page 3", () => {
    it("prevents user from moving after Step 3 if you have not entered a business name", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({ businessName: undefined });
        useMockRouter({ isReady: true, query: { page: "3" } });
        const { subject, page } = renderPage({ userData });
        page.clickNext();
        await waitFor(() => {
          expect(subject.getByTestId("step-3")).toBeInTheDocument();
          expect(subject.queryByTestId("step-4")).not.toBeInTheDocument();
          expect(
            subject.queryByText(Config.onboardingDefaults.errorTextRequiredBusinessName)
          ).toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
        });
      });
    });

    it("allows user to move past Step 3 if you have entered a business name", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({ businessName: undefined });
        useMockRouter({ isReady: true, query: { page: "3" } });
        const { subject, page } = renderPage({ userData });
        page.fillText("Business name", "A business");
        page.clickNext();

        await waitFor(() => {
          expect(
            subject.queryByText(Config.onboardingDefaults.errorTextRequiredBusinessName)
          ).not.toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
          expect(subject.queryByTestId("step-3")).not.toBeInTheDocument();
        });
      });
    });

    it("prevents user from moving after Step 3 if you have not entered a sector", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({ sectorId: undefined });
        useMockRouter({ isReady: true, query: { page: "3" } });
        const { subject, page } = renderPage({ userData });
        page.clickNext();
        await waitFor(() => {
          expect(subject.getByTestId("step-3")).toBeInTheDocument();
          expect(subject.queryByTestId("step-4")).not.toBeInTheDocument();
          expect(subject.queryByText(Config.onboardingDefaults.errorTextRequiredSector)).toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
        });
      });
    });

    it("allows user to move past Step 3 if you have entered a sector", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({ sectorId: undefined });
        useMockRouter({ isReady: true, query: { page: "3" } });
        const { subject, page } = renderPage({ userData });
        page.selectByValue("Sector", "clean-energy");
        page.clickNext();

        await waitFor(() => {
          expect(
            subject.queryByText(Config.onboardingDefaults.errorTextRequiredSector)
          ).not.toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
          expect(subject.queryByTestId("step-3")).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("page 4", () => {
    it("prevents user from moving after Step 4 if you have not entered number of employees", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({ existingEmployees: undefined, municipality: undefined });
        useMockRouter({ isReady: true, query: { page: "4" } });
        const newark = generateMunicipality({ displayName: "Newark" });
        const { subject, page } = renderPage({
          municipalities: [newark],
          userData,
        });
        expect(subject.getByTestId("step-4")).toBeInTheDocument();
        page.selectByText("Location", "Newark");
        page.clickNext();

        await waitFor(() => {
          subject.getByText(Config.onboardingDefaults.errorTextRequiredExistingEmployees);
          expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
        });
      });
    });

    it("allows user to move past Step 4 if you have entered number of employees", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({ existingEmployees: undefined, municipality: undefined });
        useMockRouter({ isReady: true, query: { page: "4" } });
        const newark = generateMunicipality({ displayName: "Newark" });
        const { subject, page } = renderPage({
          municipalities: [newark],
          userData,
        });
        expect(subject.getByTestId("step-4")).toBeInTheDocument();
        page.fillText("Existing employees", "123");
        page.selectByText("Location", "Newark");
        page.clickNext();

        await waitFor(() => {
          expect(
            subject.queryByText(Config.onboardingDefaults.errorTextRequiredExistingEmployees)
          ).not.toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
          expect(subject.queryByTestId("step-4")).not.toBeInTheDocument();
        });
      });
    });
    it("prevents user from moving after Step 4 if you have not selected a location", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({ municipality: undefined });
        useMockRouter({ isReady: true, query: { page: "4" } });
        const newark = generateMunicipality({ displayName: "Newark" });
        const { subject, page } = renderPage({ municipalities: [newark], userData });
        page.clickNext();
        await waitFor(() => {
          expect(subject.getByTestId("step-4")).toBeInTheDocument();
          expect(
            subject.queryByText(Config.onboardingDefaults.errorTextRequiredMunicipality)
          ).toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
        });
      });
    });

    it("allows user to move past Step 4 if you have selected a location", async () => {
      act(async () => {
        const userData = generateCCorpTestUserData({ municipality: undefined });
        useMockRouter({ isReady: true, query: { page: "4" } });
        const newark = generateMunicipality({ displayName: "Newark" });
        const { subject, page } = renderPage({ municipalities: [newark], userData });
        page.selectByText("Location", "Newark");
        page.clickNext();
        await waitFor(() => {
          expect(
            subject.queryByText(Config.onboardingDefaults.errorTextRequiredMunicipality)
          ).not.toBeInTheDocument();
          expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
        });
      });
    });
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    act(async () => {
      const newark = generateMunicipality({ displayName: "Newark" });
      const { subject, page } = renderPage({ municipalities: [newark] });

      page.chooseRadio("has-existing-business-true");
      page.selectByValue("Legal structure", "c-corporation");
      expect(subject.getByTestId("step-1")).toBeInTheDocument();

      await page.visitStep2();
      page.selectDate("Date of formation", date);
      page.fillText("Entity id", "1234567890");
      expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
      expect(subject.getByTestId("step-2")).toBeInTheDocument();

      await page.visitStep3();
      page.fillText("Business name", "Cool Computers");
      page.selectByValue("Sector", "clean-energy");
      expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
      expect(subject.getByTestId("step-3")).toBeInTheDocument();

      await page.visitStep4();
      page.selectByText("Location", "Newark");
      expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 4 } }, undefined, { shallow: true });
      expect(subject.getByTestId("step-4")).toBeInTheDocument();
    });
  });

  it("shows correct next-button text on each page if user requires legal filings", async () => {
    act(async () => {
      const newark = generateMunicipality({ displayName: "Newark" });
      const { subject, page } = renderPage({ municipalities: [newark] });
      page.chooseRadio("has-existing-business-true");
      page.selectByValue("Legal structure", "c-corporation");
      const page1 = within(subject.getByTestId("page-1-form"));
      expect(page1.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
      expect(page1.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

      await page.visitStep2();
      page.selectDate("Date of formation", date);
      const page2 = within(subject.getByTestId("page-2-form"));
      expect(page2.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
      expect(page2.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

      await page.visitStep3();
      page.fillText("Business name", "Cool Computers");
      page.selectByValue("Sector", "clean-energy");
      const page3 = within(subject.getByTestId("page-3-form"));
      expect(page3.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
      expect(page3.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

      await page.visitStep4();
      const page4 = within(subject.getByTestId("page-4-form"));
      expect(page4.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
      expect(page4.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
      page.fillText("Existing employees", "1234567");
      page.selectByText("Location", "Newark");
      page.selectByValue("Ownership", "veteran-owned");
      page.selectByValue("Ownership", "disabled-veteran");
      page.chooseRadio("home-based-business-true");

      await page.visitStep5();
      const page5 = within(subject.getByTestId("page-5-form"));
      expect(page5.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
      expect(page5.queryByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
    });
  });

  it("shows correct next-button text on each page if legal structure  does not require Public Filing", async () => {
    act(async () => {
      const newark = generateMunicipality({ displayName: "Newark" });
      const { subject, page } = renderPage({ municipalities: [newark] });
      page.chooseRadio("has-existing-business-true");
      page.selectByValue("Legal structure", "sole-proprietorship");
      const page1 = within(subject.getByTestId("page-1-form"));
      expect(page1.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
      expect(page1.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

      await page.visitStep2();
      page.fillText("Business name", "Cool Computers");
      page.selectByValue("Sector", "clean-energy");
      const page2 = within(subject.getByTestId("page-2-form"));
      expect(page2.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
      expect(page2.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

      await page.visitStep3();
      const page3 = within(subject.getByTestId("page-3-form"));
      expect(page3.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
      expect(page3.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
      page.fillText("Existing employees", "1234567");
      page.selectByText("Location", "Newark");
      page.selectByValue("Ownership", "veteran-owned");
      page.selectByValue("Ownership", "disabled-veteran");
      page.chooseRadio("home-based-business-true");

      await page.visitStep4();
      const page4 = within(subject.getByTestId("page-4-form"));
      expect(page4.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
      expect(page4.queryByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
    });
  });

  it("updates the user data after each form page", async () => {
    act(async () => {
      const initialUserData = createEmptyUserData(generateUser({}));
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({ userData: initialUserData, municipalities: [newark] });

      page.chooseRadio("has-existing-business-true");
      page.selectByValue("Legal structure", "c-corporation");
      await page.visitStep2();
      expect(currentUserData().profileData.hasExistingBusiness).toEqual(true);
      page.selectDate("Date of formation", date);
      page.fillText("Entity id", "1234567890");
      await page.visitStep3();
      expect(currentUserData().profileData.dateOfFormation).toEqual(dateOfFormation);
      expect(currentUserData().profileData.entityId).toEqual("1234567890");
      page.fillText("Business name", "Cool Computers");
      page.selectByValue("Sector", "clean-energy");
      await page.visitStep4();
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(false);
      page.fillText("Existing employees", "1234567");
      page.selectByText("Location", "Newark");
      page.selectByValue("Ownership", "veteran-owned");
      page.selectByValue("Ownership", "disabled-veteran");
      page.chooseRadio("home-based-business-true");
      await page.visitStep5();
      expect(currentUserData()).toEqual({
        ...initialUserData,
        formProgress: "UNSTARTED",
        profileData: {
          ...initialUserData.profileData,
          hasExistingBusiness: true,
          initialOnboardingFlow: "OWNING",
          businessName: "Cool Computers",
          homeBasedBusiness: true,
          legalStructureId: "c-corporation",
          dateOfFormation,
          municipality: newark,
          entityId: "1234567890",
          ownershipTypeIds: ["veteran-owned", "disabled-veteran"],
          existingEmployees: "1234567",
          sectorId: "clean-energy",
          industryId: "generic",
        },
      });
    });
  });

  it("prefills form from existing user data", async () => {
    act(async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: true,
          legalStructureId: "c-corporation",
          entityId: "0123456789",
          dateOfFormation,
          businessName: "Applebees",
          municipality: generateMunicipality({
            displayName: "Newark",
          }),
          sectorId: "clean-energy",
        }),
      });

      const { page } = renderPage({ userData });
      expect(page.getRadioButtonValue("Has Existing Business")).toEqual("true");

      expect(page.getLegalStructureValue()).toEqual("c-corporation");
      await page.visitStep2();
      expect(page.getEntityIdValue()).toEqual("0123456789");
      expect(page.getDateOfFormationValue()).toEqual(date.format("MM/YYYY"));
      await page.visitStep3();
      expect(page.getBusinessNameValue()).toEqual("Applebees");
      expect(page.getSectorIDValue()).toEqual("Clean Energy");
      await page.visitStep4();
      expect(page.getMunicipalityValue()).toEqual("Newark");
    });
  });

  it("updates tax filing data on save", async () => {
    act(async () => {
      const taxData = generateTaxFilingData({});
      mockApi.postGetAnnualFilings.mockImplementation((userData) =>
        Promise.resolve({ ...userData, taxFilingData: { ...taxData, filings: [] } })
      );
      const initialUserData = generateUserData({
        taxFilingData: taxData,
        profileData: generateProfileData({
          legalStructureId: "c-corporation",
          hasExistingBusiness: true,
        }),
      });
      const { page } = renderPage({ userData: initialUserData });
      expect(page.getRadioButtonValue("Has Existing Business")).toEqual("true");
      await page.visitStep2();
      await page.visitStep3();
      await page.visitStep4();
      await page.visitStep5();
      page.clickNext();

      await waitFor(() => {
        expect(currentUserData()).toEqual({
          ...initialUserData,
          taxFilingData: { ...taxData, filings: [] },
        });
      });
    });
  });

  describe("validates self-reg step for legal structures that require public filing", () => {
    runSelfRegPageTests(
      { hasExistingBusiness: true, requiresPublicFiling: true },
      async (page: PageHelpers) => {
        await page.visitStep2();
        await page.visitStep3();
        await page.visitStep4();
        await page.visitStep5();
      }
    );
  });
  describe("validates self-reg step for legal structures that do not require public filing", () => {
    runSelfRegPageTests(
      { hasExistingBusiness: true, requiresPublicFiling: false },
      async (page: PageHelpers) => {
        await page.visitStep2();
        await page.visitStep3();
        await page.visitStep4();
      }
    );
  });
});

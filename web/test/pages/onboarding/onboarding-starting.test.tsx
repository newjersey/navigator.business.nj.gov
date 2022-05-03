import * as api from "@/lib/api-client/apiClient";
import { templateEval } from "@/lib/utils/helpers";
import { generateMunicipality, generateProfileData, generateUser, generateUserData } from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import { PageHelpers, renderPage, runSelfRegPageTests } from "@/test/pages/onboarding/helpers-onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  createEmptyUser,
  createEmptyUserData,
  LookupIndustryById,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { waitFor, within } from "@testing-library/react";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

const generateTestUserData = (overrides: Partial<ProfileData>) =>
  generateUserData({
    profileData: generateProfileData({
      ...overrides,
    }),
    formProgress: "UNSTARTED",
  });

describe("onboarding - starting a business", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    setupStatefulUserDataContext();
    mockApi.postGetAnnualFilings.mockImplementation((request) => Promise.resolve(request));
    mockApi.postNewsletter.mockImplementation((request) =>
      Promise.resolve({
        ...request,
        user: {
          ...request.user,
          externalStatus: {
            ...request.user.externalStatus,
            newsletter: { status: "SUCCESS", success: true },
          },
        },
      })
    );

    mockApi.postUserTesting.mockImplementation((request) =>
      Promise.resolve({
        ...request,
        user: {
          ...request.user,
          externalStatus: {
            ...request.user.externalStatus,
            userTesting: { status: "SUCCESS", success: true },
          },
        },
      })
    );
  });
  describe("page 1", () => {
    it("uses special template eval for step 1 label", async () => {
      const { subject, page } = renderPage({});
      expect(
        subject.getByText(templateEval(Config.onboardingDefaults.stepOneTemplate, { currentPage: "1" }))
      ).toBeInTheDocument();
      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();
      expect(
        subject.getByText(
          templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "2", totalPages: "5" })
        )
      ).toBeInTheDocument();
    });

    it("does not display the legal structure dropdown", async () => {
      const { subject, page } = renderPage({});
      page.chooseRadio("has-existing-business-false");
      expect(subject.queryByLabelText("Legal structure")).not.toBeInTheDocument();
    });
  });

  describe("page 2", () => {
    it("prevents user from moving after Step 2 if you have not selected an industry", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, industryId: undefined });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { subject, page } = renderPage({ userData });
      page.clickNext();
      expect(subject.getByTestId("step-2")).toBeInTheDocument();
      expect(subject.queryByTestId("step-3")).not.toBeInTheDocument();
      expect(subject.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 2 if you have selected an industry", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, industryId: undefined });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { subject, page } = renderPage({ userData });
      page.selectByText("Industry", "Any Other Business Type");
      await page.visitStep3();
      expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
      expect(subject.getByTestId("step-3")).toBeInTheDocument();
      expect(subject.queryByTestId("step-2")).not.toBeInTheDocument();
    });
  });

  describe("page 3", () => {
    it("prevents user from moving after Step 3 if you have not selected a legal structure", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, legalStructureId: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { subject, page } = renderPage({ userData });
      page.clickNext();
      expect(subject.getByTestId("step-3")).toBeInTheDocument();
      expect(subject.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(subject.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    });

    it("allows user to move past Step 3 if you have selected a legal structure", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, legalStructureId: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { subject, page } = renderPage({ userData });
      page.chooseRadio("general-partnership");
      await page.visitStep4();
      expect(subject.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
      expect(subject.getByTestId("step-4")).toBeInTheDocument();
      expect(subject.queryByTestId("step-3")).not.toBeInTheDocument();
    });
  });

  describe("page 4", () => {
    it("prevents user from moving after Step 4 if you have not selected a location", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, municipality: undefined });
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

    it("allows user to move past Step 4 if you have selected a location", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, municipality: undefined });
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

  it("changes url pathname every time a user goes to a different page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { subject, page } = renderPage({ municipalities: [newark] });
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
    page.chooseRadio("has-existing-business-false");

    await page.visitStep2();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-2")).toBeInTheDocument();
    page.selectByText("Industry", "Any Other Business Type");

    await page.visitStep3();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-3")).toBeInTheDocument();
    page.chooseRadio("general-partnership");

    await page.visitStep4();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 4 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
    page.selectByText("Location", "Newark");

    await page.visitStep5();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 5 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-5")).toBeInTheDocument();
  });

  it("shows correct next-button text on each page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { subject, page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("has-existing-business-false");
    const page1 = within(subject.getByTestId("page-1-form"));
    expect(page1.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page1.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep2();
    const page2 = within(subject.getByTestId("page-2-form"));
    expect(page2.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page2.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.selectByText("Industry", "Any Other Business Type");

    await page.visitStep3();
    const page3 = within(subject.getByTestId("page-3-form"));
    expect(page3.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page3.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.chooseRadio("general-partnership");

    await page.visitStep4();
    const page4 = within(subject.getByTestId("page-4-form"));
    expect(page4.queryByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page4.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.selectByText("Location", "Newark");

    await page.visitStep5();
    const page5 = within(subject.getByTestId("page-5-form"));
    expect(page5.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page5.queryByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        hasExistingBusiness: false,
        businessName: "Applebees",
        industryId: "cosmetology",
        legalStructureId: "c-corporation",
        municipality: generateMunicipality({
          displayName: "Newark",
        }),
      }),
      user: generateUser({
        name: "Michael Deeb",
        email: "mdeeb@example.com",
      }),
    });

    const { page } = renderPage({ userData });
    expect(page.getRadioButtonValue("Has Existing Business")).toEqual("false");

    await page.visitStep2();
    expect(page.getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);

    await page.visitStep3();
    expect(page.getRadioButtonValue("Legal structure")).toEqual("c-corporation");

    await page.visitStep4();
    expect(page.getMunicipalityValue()).toEqual("Newark");

    await page.visitStep5();
    expect(page.getFullNameValue()).toEqual("Michael Deeb");
    expect(page.getEmailValue()).toEqual("mdeeb@example.com");
    expect(page.getConfirmEmailValue()).toEqual("mdeeb@example.com");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(createEmptyUser());
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ userData: initialUserData, municipalities: [newark] });

    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    expect(currentUserData().profileData.hasExistingBusiness).toEqual(false);

    page.selectByValue("Industry", "e-commerce");
    await page.visitStep3();
    expect(currentUserData().profileData.industryId).toEqual("e-commerce");
    expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);

    page.chooseRadio("general-partnership");
    await page.visitStep4();
    expect(currentUserData().profileData.legalStructureId).toEqual("general-partnership");

    page.selectByText("Location", "Newark");
    await page.visitStep5();
    expect(currentUserData().profileData.municipality?.displayName).toEqual("Newark");

    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    page.clickNext();

    await waitFor(() => {
      const expectedUserData: UserData = {
        ...initialUserData,
        formProgress: "COMPLETED",
        profileData: {
          ...initialUserData.profileData,
          initialOnboardingFlow: "STARTING",
          hasExistingBusiness: false,
          businessName: "",
          industryId: "e-commerce",
          sectorId: "retail-trade-and-ecommerce",
          homeBasedBusiness: true,
          legalStructureId: "general-partnership",
          municipality: newark,
        },
        user: {
          ...initialUserData.user,
          name: "My Name",
          email: "email@example.com",
        },
      };

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
        user: {
          ...expectedUserData.user,
          externalStatus: {
            newsletter: { status: "SUCCESS", success: true },
            userTesting: { status: "SUCCESS", success: true },
          },
        },
      });
    });
  });

  it("removes required fields error when user goes back", async () => {
    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    page.selectByText("Industry", "Any Other Business Type");
    await page.visitStep3();
    page.clickNext();
    expect(subject.getByTestId("step-3")).toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    page.clickBack();
    expect(subject.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
  });

  describe("validates self-reg step", () => {
    runSelfRegPageTests({ hasExistingBusiness: false }, async (page: PageHelpers) => {
      await page.visitStep2();
      await page.visitStep3();
      await page.visitStep4();
      await page.visitStep5();
    });
  });
});

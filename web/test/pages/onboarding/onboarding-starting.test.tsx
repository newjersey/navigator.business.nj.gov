import * as api from "@/lib/api-client/apiClient";
import { templateEval } from "@/lib/utils/helpers";
import { generateMunicipality, generateProfileData, generateUser, generateUserData } from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import { renderPage, runSelfRegPageTests } from "@/test/pages/onboarding/helpers-onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  createEmptyUser,
  createEmptyUserData,
  LookupIndustryById,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { act, screen, waitFor, within } from "@testing-library/react";

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
    jest.useFakeTimers();
  });
  describe("page 1", () => {
    it("uses special template eval for step 1 label", async () => {
      const { page } = renderPage({});
      expect(
        screen.getByText(templateEval(Config.onboardingDefaults.stepOneTemplate, { currentPage: "1" }))
      ).toBeInTheDocument();
      page.chooseRadio("has-existing-business-false");
      act(() => page.clickNext());
      await waitFor(() => expect(screen.queryByTestId("step-1")).not.toBeInTheDocument());
      expect(
        screen.getByText(
          templateEval(Config.onboardingDefaults.stepXofYTemplate, { currentPage: "2", totalPages: "5" })
        )
      ).toBeInTheDocument();
    });

    it("does not display the legal structure dropdown", async () => {
      const { page } = renderPage({});
      page.chooseRadio("has-existing-business-false");
      expect(screen.queryByLabelText("Legal structure")).not.toBeInTheDocument();
    });
  });

  describe("page 2", () => {
    it("prevents user from moving after Step 2 if you have not selected an industry", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, industryId: undefined });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      act(() => page.clickNext());
      expect(screen.getByTestId("step-2")).toBeInTheDocument();
      expect(screen.queryByTestId("step-3")).not.toBeInTheDocument();
      expect(screen.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 2 if you have selected an industry", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, industryId: undefined });
      useMockRouter({ isReady: true, query: { page: "2" } });
      const { page } = renderPage({ userData });
      page.selectByText("Industry", "Any Other Business Type");
      act(() => page.clickNext());
      await waitFor(() => expect(screen.queryByTestId("step-2")).not.toBeInTheDocument());
      expect(screen.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
      expect(screen.getByTestId("step-3")).toBeInTheDocument();
      expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
    });
  });

  describe("page 3", () => {
    it("prevents user from moving after Step 3 if you have not selected a legal structure", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, legalStructureId: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      act(() => page.clickNext());
      expect(screen.getByTestId("step-3")).toBeInTheDocument();
      expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(screen.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    });

    it("allows user to move past Step 3 if you have selected a legal structure", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, legalStructureId: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.chooseRadio("general-partnership");
      act(() => page.clickNext());
      await waitFor(() => expect(screen.queryByTestId("step-3")).not.toBeInTheDocument());
      expect(screen.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
      expect(screen.getByTestId("step-4")).toBeInTheDocument();
    });
  });

  describe("page 4", () => {
    it("prevents user from moving after Step 4 if you have not selected a location", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, municipality: undefined });
      useMockRouter({ isReady: true, query: { page: "4" } });
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({ municipalities: [newark], userData });
      act(() => page.clickNext());
      await waitFor(() => {
        expect(screen.getByTestId("step-4")).toBeInTheDocument();
      });
      expect(screen.getByText(Config.onboardingDefaults.errorTextRequiredMunicipality)).toBeInTheDocument();
      expect(screen.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 4 if you have selected a location", async () => {
      const userData = generateTestUserData({ hasExistingBusiness: false, municipality: undefined });
      useMockRouter({ isReady: true, query: { page: "4" } });
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({ municipalities: [newark], userData });
      page.selectByText("Location", "Newark");
      act(() => page.clickNext());
      await waitFor(() => expect(screen.queryByTestId("step-4")).not.toBeInTheDocument());
      expect(
        screen.queryByText(Config.onboardingDefaults.errorTextRequiredMunicipality)
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
    });
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    page.chooseRadio("has-existing-business-false");

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-1")).not.toBeInTheDocument());
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
    page.selectByText("Industry", "Any Other Business Type");

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-2")).not.toBeInTheDocument());
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-3")).toBeInTheDocument();
    page.chooseRadio("general-partnership");

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-3")).not.toBeInTheDocument());
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 4 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-4")).toBeInTheDocument();
    page.selectByText("Location", "Newark");

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-4")).not.toBeInTheDocument());
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 5 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-5")).toBeInTheDocument();
  });

  it("shows correct next-button text on each page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("has-existing-business-false");
    const page1 = within(screen.getByTestId("page-1-form"));
    expect(page1.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page1.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-1")).not.toBeInTheDocument());
    const page2 = within(screen.getByTestId("page-2-form"));
    expect(page2.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page2.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.selectByText("Industry", "Any Other Business Type");

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-2")).not.toBeInTheDocument());
    const page3 = within(screen.getByTestId("page-3-form"));
    expect(page3.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page3.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.chooseRadio("general-partnership");

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-3")).not.toBeInTheDocument());
    const page4 = within(screen.getByTestId("page-4-form"));
    expect(page4.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page4.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.selectByText("Location", "Newark");

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-4")).not.toBeInTheDocument());
    const page5 = within(screen.getByTestId("page-5-form"));
    expect(page5.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page5.getByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
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
    expect(page.getRadioButton("Has Existing Business - False")).toBeChecked();

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-1")).not.toBeInTheDocument());
    expect(page.getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-2")).not.toBeInTheDocument());
    expect(page.getRadioButton("c-corporation")).toBeChecked();

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-3")).not.toBeInTheDocument());
    expect(page.getMunicipalityValue()).toEqual("Newark");

    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-4")).not.toBeInTheDocument());
    expect(page.getFullNameValue()).toEqual("Michael Deeb");
    expect(page.getEmailValue()).toEqual("mdeeb@example.com");
    expect(page.getConfirmEmailValue()).toEqual("mdeeb@example.com");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(createEmptyUser());
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ userData: initialUserData, municipalities: [newark] });

    page.chooseRadio("has-existing-business-false");
    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-1")).not.toBeInTheDocument());
    expect(currentUserData().profileData.hasExistingBusiness).toEqual(false);

    page.selectByValue("Industry", "e-commerce");
    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-2")).not.toBeInTheDocument());
    expect(currentUserData().profileData.industryId).toEqual("e-commerce");
    expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);

    page.chooseRadio("general-partnership");
    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-3")).not.toBeInTheDocument());
    expect(currentUserData().profileData.legalStructureId).toEqual("general-partnership");

    page.selectByText("Location", "Newark");
    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-4")).not.toBeInTheDocument());
    expect(currentUserData().profileData.municipality?.displayName).toEqual("Newark");

    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    page.clickNext();

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
    await waitFor(() => {
      expect(mockApi.postNewsletter).toHaveBeenCalledWith({
        ...expectedUserData,
        user: { ...expectedUserData.user, externalStatus: {} },
      });
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

  it("removes required fields error when user goes back", async () => {
    const { page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    act(() => page.clickNext());
    await waitFor(() => expect(screen.queryByTestId("step-1")).not.toBeInTheDocument());
    page.selectByText("Industry", "Any Other Business Type");
    await page.visitStep3();
    act(() => page.clickNext());
    expect(screen.getByTestId("step-3")).toBeInTheDocument();
    expect(screen.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    page.clickBack();
    expect(screen.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
  });

  describe("validates self-reg step", () => {
    runSelfRegPageTests({ hasExistingBusiness: false, selfRegPage: "5" });
  });
});

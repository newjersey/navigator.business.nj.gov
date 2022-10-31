import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { getFlow } from "@/lib/utils/helpers";
import { generateMunicipality, generateProfileData, generateUser, generateUserData } from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  mockSuccessfulApiSignups,
  renderPage,
  runSelfRegPageTests,
} from "@/test/pages/onboarding/helpers-onboarding";
import {
  createEmptyUser,
  createEmptyUserData,
  LookupIndustryById,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { act, screen, waitFor, within } from "@testing-library/react";

jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/roadmap/buildUserRoadmap", () => {
  return { buildUserRoadmap: jest.fn() };
});
jest.mock("@/lib/api-client/apiClient", () => {
  return {
    postNewsletter: jest.fn(),
    postUserTesting: jest.fn(),
    postGetAnnualFilings: jest.fn(),
  };
});

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();

const generateTestUserData = (overrides: Partial<ProfileData>) => {
  return generateUserData({
    profileData: generateProfileData({
      businessPersona: "STARTING",
      ...overrides,
    }),
    formProgress: "UNSTARTED",
  });
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
      expect(screen.queryByTestId("step-2")).not.toBeInTheDocument();
    });
  });

  describe("page 3", () => {
    it("prevents user from moving after Step 3 if you have not selected a legal structure", async () => {
      const userData = generateTestUserData({ legalStructureId: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      act(() => {
        return page.clickNext();
      });
      expect(screen.getByTestId("step-3")).toBeInTheDocument();
      expect(screen.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(screen.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    });

    it("allows user to move past Step 3 if you have selected a legal structure", async () => {
      const userData = generateTestUserData({ legalStructureId: undefined });
      useMockRouter({ isReady: true, query: { page: "3" } });
      const { page } = renderPage({ userData });
      page.chooseRadio("general-partnership");
      await page.visitStep(4);
      expect(screen.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
    });
  });

  describe("page 4", () => {
    it("prevents user from moving after Step 4 if you have not selected a location", async () => {
      const userData = generateTestUserData({ municipality: undefined });
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
        screen.getByText(Config.profileDefaults[getFlow(userData)].municipality.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it("allows user to move past Step 4 if you have selected a location", async () => {
      const userData = generateTestUserData({ municipality: undefined });
      useMockRouter({ isReady: true, query: { page: "4" } });
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({ municipalities: [newark], userData });
      page.selectByText("Location", "Newark");
      await page.visitStep(5);
      expect(
        screen.queryByText(Config.profileDefaults[getFlow(userData)].municipality.errorTextRequired)
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
    });
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ municipalities: [newark] });
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    page.chooseRadio("business-persona-starting");

    await page.visitStep(2);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
    page.selectByText("Industry", "All Other Businesses");

    await page.visitStep(3);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-3")).toBeInTheDocument();
    page.chooseRadio("general-partnership");

    await page.visitStep(4);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 4 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-4")).toBeInTheDocument();
    page.selectByText("Location", "Newark");

    await page.visitStep(5);
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 5 } }, undefined, { shallow: true });
    expect(screen.getByTestId("step-5")).toBeInTheDocument();
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
    expect(page3.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page3.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.chooseRadio("general-partnership");

    await page.visitStep(4);
    const page4 = within(screen.getByTestId("page-4-form"));
    expect(page4.getByText(Config.onboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page4.queryByText(Config.onboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();
    page.selectByText("Location", "Newark");

    await page.visitStep(5);
    const page5 = within(screen.getByTestId("page-5-form"));
    expect(page5.queryByText(Config.onboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page5.getByText(Config.onboardingDefaults.finalNextButtonText)).toBeInTheDocument();
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
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
    expect(page.getRadioButton("Business Status - Starting")).toBeChecked();

    await page.visitStep(2);
    expect(page.getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);

    await page.visitStep(3);
    expect(page.getRadioButton("c-corporation")).toBeChecked();

    await page.visitStep(4);
    expect(page.getMunicipalityValue()).toEqual("Newark");

    await page.visitStep(5);
    expect(page.getFullNameValue()).toEqual("Michael Deeb");
    expect(page.getEmailValue()).toEqual("mdeeb@example.com");
    expect(page.getConfirmEmailValue()).toEqual("mdeeb@example.com");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(createEmptyUser());
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ userData: initialUserData, municipalities: [newark] });

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    expect(currentUserData().profileData.businessPersona).toEqual("STARTING");

    page.selectByValue("Industry", "e-commerce");
    await page.visitStep(3);
    expect(currentUserData().profileData.industryId).toEqual("e-commerce");

    page.chooseRadio("general-partnership");
    await page.visitStep(4);
    expect(currentUserData().profileData.legalStructureId).toEqual("general-partnership");

    page.selectByText("Location", "Newark");
    await page.visitStep(5);
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
        businessPersona: "STARTING",
        businessName: "",
        industryId: "e-commerce",
        sectorId: "retail-trade-and-ecommerce",
        homeBasedBusiness: undefined,
        legalStructureId: "general-partnership",
        municipality: newark,
      },
      preferences: {
        ...initialUserData.preferences,
        visibleSidebarCards: ["welcome"],
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
      preferences: {
        ...expectedUserData.preferences,
        visibleSidebarCards: ["welcome", "task-progress"],
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
    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    page.selectByText("Industry", "All Other Businesses");
    await page.visitStep(3);
    act(() => {
      return page.clickNext();
    });
    expect(screen.getByTestId("step-3")).toBeInTheDocument();
    expect(screen.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    page.clickBack();
    expect(screen.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
  });

  describe("validates self-reg step", () => {
    runSelfRegPageTests({ businessPersona: "STARTING", selfRegPage: "5" });
  });
});

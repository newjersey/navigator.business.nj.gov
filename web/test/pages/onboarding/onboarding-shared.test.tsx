import { getOnboardingFlows } from "@/components/onboarding/getOnboardingFlows";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import Onboarding from "@/pages/onboarding";
import { generateProfileData, generateUser, generateUserData } from "@/test/factories";
import { withAuth, withRoadmap } from "@/test/helpers/helpers-renderers";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  getLastCalledWithConfig,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { createPageHelpers, renderPage } from "@/test/pages/onboarding/helpers-onboarding";
import {
  createEmptyProfileData,
  defaultDateFormat,
  generateMunicipality,
  getCurrentDate,
} from "@businessnjgovnavigator/shared/";
import { render, screen, waitFor } from "@testing-library/react";

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
    postSelfReg: jest.fn(),
    postNewsletter: jest.fn(),
    postUserTesting: jest.fn(),
    postGetAnnualFilings: jest.fn(),
  };
});

const mockApi = api as jest.Mocked<typeof api>;
const date = getCurrentDate().subtract(1, "month").date(1);
const Config = getMergedConfig();

describe("onboarding - shared", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    setupStatefulUserDataContext();
    mockApi.postSelfReg.mockResolvedValue({ authRedirectURL: "", userData: generateUserData({}) });
    mockApi.postGetAnnualFilings.mockImplementation((request) => {
      return Promise.resolve(request);
    });
  });

  it("routes to the first onboarding question when they have not answered the first question", async () => {
    useMockRouter({ isReady: true, query: { page: "3" } });
    renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it("routes to the second onboarding page when they have answered the first question and we route them to page 2", async () => {
    useMockRouter({ isReady: true, query: { page: "2" } });
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "c-corporation",
      }),
      formProgress: "UNSTARTED",
    });

    renderPage({ userData });
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

  it("routes to the second page with industry set when using industry query string", async () => {
    useMockRouter({ isReady: true, query: { industry: "cannabis" } });
    const { page } = renderPage({});
    expect(screen.getByTestId("step-2")).toBeInTheDocument();
    await page.visitStep(3);
    await waitFor(() => {
      expect(currentUserData().profileData.businessPersona).toEqual("STARTING");
    });
    expect(currentUserData().profileData.industryId).toEqual("cannabis");
  });

  it("routes to the first page when using industry query string is invalid", async () => {
    useMockRouter({ isReady: true, query: { industry: "something-nonexistent" } });
    renderPage({});
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it("builds and sets roadmap after each step", async () => {
    const profileData = generateProfileData({ businessPersona: "STARTING" });
    const mockSetRoadmap = jest.fn();
    const user = generateUser({});
    const userData = generateUserData({ profileData: profileData, user });
    render(
      withRoadmap(
        withAuth(
          <WithStatefulUserData initialUserData={userData}>
            <Onboarding municipalities={[]} />
          </WithStatefulUserData>,
          { user: user, isAuthenticated: IsAuthenticated.TRUE }
        ),
        undefined,
        undefined,
        mockSetRoadmap
      )
    );

    const page = createPageHelpers();

    const numberOfPages = getOnboardingFlows(
      userData.profileData,
      userData.user,
      () => {},
      createProfileFieldErrorMap()
    ).STARTING.pages.length;

    for (let pageNumber = 2; pageNumber < numberOfPages; pageNumber += 1) {
      await page.visitStep(pageNumber);
      expect(mockSetRoadmap).toHaveBeenCalledTimes(pageNumber - 1);
    }

    page.clickNext();
    await waitFor(() => {
      return expect(mockSetRoadmap).toHaveBeenCalledTimes(numberOfPages - 1);
    });
  });

  it("generates a new empty userData object during guest checkout", async () => {
    renderPage({ userData: null, user: generateUser({}), isAuthenticated: IsAuthenticated.FALSE });
    await waitFor(() => {
      return expect(currentUserData().user).not.toBeFalsy();
    });
  });

  it("updates locally for each step", async () => {
    const userData = generateUserData({ profileData: generateProfileData({ businessPersona: "STARTING" }) });
    const { page } = renderPage({ userData });
    mockApi.postNewsletter.mockImplementation((request) => {
      return Promise.resolve(request);
    });
    mockApi.postUserTesting.mockImplementation((request) => {
      return Promise.resolve(request);
    });
    const numberOfPages = getOnboardingFlows(
      userData.profileData,
      userData.user,
      () => {},
      createProfileFieldErrorMap()
    ).STARTING.pages.length;

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
    const initialUserData = generateUserData({
      formProgress: "UNSTARTED",
      profileData: createEmptyProfileData(),
    });
    const { page } = renderPage({ userData: initialUserData });

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    page.selectByValue("Industry", "e-commerce");
    await page.visitStep(3);
    page.chooseRadio("general-partnership");

    page.clickBack();
    page.clickBack();

    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.getByTestId("business-persona-owning")).toBeInTheDocument();
    expect(
      screen.getByText(templateEval(Config.onboardingDefaults.stepXTemplate, { currentPage: "1" }))
    ).toBeInTheDocument();
    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "c-corporation");
    await page.visitStep(2);
    expect(currentUserData().profileData).toEqual({
      ...initialUserData.profileData,
      businessPersona: "OWNING",
      entityId: undefined,
      businessName: "",
      industryId: "generic",
      homeBasedBusiness: undefined,
      legalStructureId: "c-corporation",
      municipality: undefined,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      ownershipTypeIds: [],
      operatingPhase: "GUEST_MODE_OWNING",
    });
  });

  it("resets non-shared information when switching from owning flow to starting flow with non-filing legal structure", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const initialUserData = generateUserData({
      formProgress: "UNSTARTED",
      profileData: createEmptyProfileData(),
    });
    const { page } = renderPage({ municipalities: [newark], userData: initialUserData });

    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "sole-proprietorship");
    await page.visitStep(2);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep(3);
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");

    page.clickBack();
    page.clickBack();

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    expect(currentUserData().profileData).toEqual({
      ...initialUserData.profileData,
      businessPersona: "STARTING",
      entityId: undefined,
      businessName: "Cool Computers",
      industryId: undefined,
      homeBasedBusiness: undefined,
      dateOfFormation: undefined,
      legalStructureId: "sole-proprietorship",
      municipality: newark,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      ownershipTypeIds: [],
    });
  });

  it("resets non-shared information when switching from owning flow to starting flow", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const initialUserData = generateUserData({
      formProgress: "UNSTARTED",
      profileData: createEmptyProfileData(),
    });
    const { page } = renderPage({ municipalities: [newark], userData: initialUserData });

    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "c-corporation");
    await page.visitStep(2);
    page.selectDate("Date of formation", date);
    page.fillText("Entity id", "1234567890");
    await page.visitStep(3);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep(4);
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");

    page.clickBack();
    page.clickBack();
    page.clickBack();

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    expect(currentUserData().profileData).toEqual({
      ...initialUserData.profileData,
      businessPersona: "STARTING",
      entityId: undefined,
      businessName: "Cool Computers",
      industryId: undefined,
      homeBasedBusiness: undefined,
      dateOfFormation: undefined,
      legalStructureId: "c-corporation",
      municipality: newark,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      ownershipTypeIds: [],
    });
  });

  it("does not reset information when re-visiting page 1 but not switching the answer", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const initialUserData = generateUserData({
      formProgress: "UNSTARTED",
      profileData: createEmptyProfileData(),
    });
    const { page } = renderPage({ municipalities: [newark], userData: initialUserData });

    page.chooseRadio("business-persona-owning");
    page.selectByValue("Business structure", "c-corporation");
    await page.visitStep(2);
    page.selectDate("Date of formation", date);
    page.fillText("Entity id", "1234567890");
    await page.visitStep(3);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep(4);
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");

    page.clickBack();
    page.clickBack();
    page.clickBack();

    await page.visitStep(2);
    expect(currentUserData().profileData).toEqual({
      ...initialUserData.profileData,
      businessPersona: "OWNING",
      entityId: "1234567890",
      legalStructureId: "c-corporation",
      businessName: "Cool Computers",
      industryId: "generic",
      dateOfFormation: date.format(defaultDateFormat),
      homeBasedBusiness: undefined,
      municipality: newark,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      ownershipTypeIds: ["veteran-owned"],
      sectorId: "clean-energy",
      operatingPhase: "GUEST_MODE_OWNING",
    });
  });

  it("displays error message when @ is missing in email input field", async () => {
    useMockRouter({ isReady: true, query: { page: "4" } });
    const { page } = renderPage({
      userData: generateUserData({
        user: generateUser({ email: `some-emailexample.com` }),
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "c-corporation",
        }),
        formProgress: "UNSTARTED",
      }),
    });
    page.clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });
  });

  it("displays error message when . is missing in email input field", async () => {
    useMockRouter({ isReady: true, query: { page: "4" } });
    const { page } = renderPage({
      userData: generateUserData({
        user: generateUser({ email: `some-email@examplecom` }),
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "c-corporation",
        }),
        formProgress: "UNSTARTED",
      }),
    });
    page.clickNext();
    await waitFor(() => {
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });
  });

  describe("when query parameter sets onboarding flow to starting", () => {
    it("routes user to step 2 when query parameter exists and value is starting", async () => {
      useMockRouter({ isReady: true, query: { flow: "starting" } });
      const { page } = renderPage({});

      expect(screen.getByTestId("step-2")).toBeInTheDocument();
      page.selectByText("Industry", "All Other Businesses");
      await page.visitStep(3);

      expect(currentUserData().profileData.businessPersona).toEqual("STARTING");
    });
  });
});

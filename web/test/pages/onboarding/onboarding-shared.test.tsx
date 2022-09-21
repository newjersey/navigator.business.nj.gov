import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { getFlow, templateEval } from "@/lib/utils/helpers";
import Onboarding from "@/pages/onboarding";
import { generateMunicipality, generateProfileData, generateUser, generateUserData } from "@/test/factories";
import { withAuth, withRoadmap } from "@/test/helpers";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import {
  currentUserData,
  getLastCalledWithConfig,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { createPageHelpers, PageHelpers, renderPage } from "@/test/pages/onboarding/helpers-onboarding";
import { createEmptyProfileData, getCurrentDate, ProfileData } from "@businessnjgovnavigator/shared/";
import { createEmptyUserData } from "@businessnjgovnavigator/shared/userData";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postSelfReg: jest.fn(),
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const date = getCurrentDate().subtract(1, "month").date(1);
const Config = getMergedConfig();

const generateTestUserData = (overrides: Partial<ProfileData>) =>
  generateUserData({
    profileData: generateProfileData({
      ...overrides,
    }),
    formProgress: "UNSTARTED",
  });

describe("onboarding - shared", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true });
    setupStatefulUserDataContext();
    mockApi.postSelfReg.mockResolvedValue({ authRedirectURL: "", userData: generateUserData({}) });
    mockApi.postGetAnnualFilings.mockImplementation((request) => Promise.resolve(request));
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

    await page.visitStep(2);
    expect(mockSetRoadmap).toHaveBeenCalledTimes(1);
    await page.visitStep(3);
    expect(mockSetRoadmap).toHaveBeenCalledTimes(2);
    await page.visitStep(4);
    expect(mockSetRoadmap).toHaveBeenCalledTimes(3);

    page.clickNext();
    await waitFor(() => expect(mockSetRoadmap).toHaveBeenCalledTimes(4));
  });

  it("generates a new empty userData object during guest checkout", async () => {
    renderPage({ userData: null, user: generateUser({}), isAuthenticated: IsAuthenticated.FALSE });
    await waitFor(() => expect(currentUserData().user).not.toBeFalsy());
  });

  it("updates locally for each step", async () => {
    const userData = generateUserData({ profileData: generateProfileData({ businessPersona: "STARTING" }) });
    const { page } = renderPage({ userData });
    mockApi.postNewsletter.mockImplementation((request) => Promise.resolve(request));
    mockApi.postUserTesting.mockImplementation((request) => Promise.resolve(request));
    await page.visitStep(2);
    expect(getLastCalledWithConfig().local).toEqual(true);
    await page.visitStep(3);
    expect(getLastCalledWithConfig().local).toEqual(true);
    await page.visitStep(4);
    expect(getLastCalledWithConfig().local).toEqual(true);
    await page.visitStep(5);
    expect(getLastCalledWithConfig().local).toEqual(true);
  });

  it("prevents user from moving after Step 1 if you have not selected whether you own a business", async () => {
    const { page } = renderPage({});
    page.clickNext();
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.getByTestId("error-alert-REQUIRED_EXISTING_BUSINESS")).toBeInTheDocument();
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
    const newark = generateMunicipality({ displayName: "Newark" });
    const initialUserData = generateUserData({
      formProgress: "UNSTARTED",
      profileData: createEmptyProfileData(),
    });
    const { page } = renderPage({ municipalities: [newark], userData: initialUserData });

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);
    page.selectByValue("Industry", "e-commerce");
    await page.visitStep(3);
    page.chooseRadio("general-partnership");
    await page.visitStep(4);
    page.selectByText("Location", "Newark");

    page.clickBack();
    page.clickBack();
    page.clickBack();

    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.getByTestId("business-persona-owning")).toBeInTheDocument();
    expect(
      screen.getByText(templateEval(Config.onboardingDefaults.stepXTemplate, { currentPage: "1" }))
    ).toBeInTheDocument();
    page.chooseRadio("business-persona-owning");
    page.selectByValue("Legal structure", "c-corporation");
    await page.visitStep(2);
    expect(currentUserData().profileData).toEqual({
      ...initialUserData.profileData,
      businessPersona: "OWNING",
      entityId: undefined,
      businessName: "",
      industryId: "generic",
      homeBasedBusiness: true,
      legalStructureId: "c-corporation",
      municipality: newark,
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
    page.selectByValue("Legal structure", "sole-proprietorship");
    await page.visitStep(2);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep(3);
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");
    page.chooseRadio("home-based-business-true");

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
      homeBasedBusiness: true,
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
    page.selectByValue("Legal structure", "c-corporation");
    await page.visitStep(2);
    page.selectDate("Date of formation", date);
    page.fillText("Entity id", "1234567890");
    await page.visitStep(3);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep(4);
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");
    page.chooseRadio("home-based-business-true");

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
      homeBasedBusiness: true,
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
    page.selectByValue("Legal structure", "c-corporation");
    await page.visitStep(2);
    page.selectDate("Date of formation", date);
    page.fillText("Entity id", "1234567890");
    await page.visitStep(3);
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep(4);
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");
    page.chooseRadio("home-based-business-true");

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
      dateOfFormation: date.format("YYYY-MM-DD"),
      homeBasedBusiness: true,
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

  describe("when industry changes", () => {
    it("displays industry-specific content for home contractors when selected", async () => {
      const { page } = renderPage({});

      page.chooseRadio("business-persona-starting");
      await page.visitStep(2);
      expect(screen.queryByTestId("industry-specific-home-contractor")).not.toBeInTheDocument();
      page.selectByValue("Industry", "home-contractor");
      expect(screen.getByTestId("industry-specific-home-contractor")).toBeInTheDocument();

      await waitFor(() => {
        page.selectByValue("Industry", "e-commerce");
        expect(screen.queryByTestId("industry-specific-home-contractor")).not.toBeInTheDocument();
      });
    });

    it("displays industry-specific content for employment agency when selected", async () => {
      const { page } = renderPage({});
      page.chooseRadio("business-persona-starting");
      await page.visitStep(2);

      expect(screen.queryByTestId("industry-specific-employment-agency")).not.toBeInTheDocument();
      page.selectByValue("Industry", "employment-agency");
      expect(screen.getByTestId("industry-specific-employment-agency")).toBeInTheDocument();

      await waitFor(() => {
        page.selectByValue("Industry", "e-commerce");
        expect(screen.queryByTestId("industry-specific-employment-agency")).not.toBeInTheDocument();
      });
    });

    it("displays liquor license question for restaurants when selected", async () => {
      const userData = createEmptyUserData(generateUser({}));
      const { page } = renderPage({ userData });
      page.chooseRadio("business-persona-starting");
      await page.visitStep(2);

      expect(
        screen.queryByText(Config.profileDefaults[getFlow(userData)].liquorLicense.description)
      ).not.toBeInTheDocument();
      page.selectByValue("Industry", "restaurant");
      expect(
        screen.getByText(Config.profileDefaults[getFlow(userData)].liquorLicense.description)
      ).toBeInTheDocument();
      page.chooseRadio("liquor-license-true");
      await page.visitStep(3);

      expect(currentUserData().profileData.liquorLicense).toEqual(true);
    });

    it("displays home-based business question for applicable industries on municipality page", async () => {
      const newark = generateMunicipality({ displayName: "Newark" });
      const userData = generateTestUserData({
        businessPersona: "STARTING",
        industryId: "home-contractor",
        municipality: newark,
      });
      useMockRouter({ isReady: true, query: { page: "4" } });

      const { page } = renderPage({ userData, municipalities: [newark] });
      expect(screen.getByTestId("home-based-business-section")).toBeInTheDocument();
      page.selectByText("Location", "Newark");
      page.chooseRadio("home-based-business-true");
      await page.visitStep(5);
      await waitFor(() => expect(currentUserData().profileData.homeBasedBusiness).toEqual(true));
    });

    it("does not display home-based business question for non-applicable industries", async () => {
      const userData = generateTestUserData({ businessPersona: "STARTING", industryId: "restaurant" });
      useMockRouter({ isReady: true, query: { page: "4" } });

      renderPage({ userData });

      expect(
        screen.queryByText(Config.profileDefaults[getFlow(userData)].homeBased.description)
      ).not.toBeInTheDocument();
    });

    it("sets liquor license back to false if they select a different industry", async () => {
      const { page } = renderPage({});
      page.chooseRadio("business-persona-starting");
      await page.visitStep(2);

      page.selectByValue("Industry", "restaurant");
      page.chooseRadio("liquor-license-true");
      await page.visitStep(3);
      expect(currentUserData().profileData.liquorLicense).toEqual(true);

      page.clickBack();
      page.selectByValue("Industry", "cosmetology");
      await page.visitStep(3);
      expect(currentUserData().profileData.liquorLicense).toEqual(false);
    });

    it("sets sector for industry", async () => {
      const { page } = renderPage({});
      page.chooseRadio("business-persona-starting");
      await page.visitStep(2);

      page.selectByValue("Industry", "restaurant");
      await page.visitStep(3);
      expect(currentUserData().profileData.sectorId).toEqual("accommodation-and-food-services");

      page.clickBack();
      page.selectByValue("Industry", "cannabis");
      await page.visitStep(3);
      expect(currentUserData().profileData.sectorId).toEqual("cannabis");
    });

    describe("cannabis license type question", () => {
      it("displays cannabis license type question for cannabis only", async () => {
        const { page } = renderPage({});

        fireEvent.click(screen.getByRole("radio", { name: "Business Status - Starting" }));
        await page.visitStep(2);
        expect(screen.queryByTestId("industry-specific-cannabis")).not.toBeInTheDocument();
        page.selectByValue("Industry", "cannabis");
        expect(screen.getByTestId("industry-specific-cannabis")).toBeInTheDocument();

        page.selectByValue("Industry", "generic");
        expect(screen.queryByTestId("industry-specific-cannabis")).not.toBeInTheDocument();
      });

      it("defaults cannabis license type to CONDITIONAL", async () => {
        const { page } = renderPage({});

        fireEvent.click(screen.getByRole("radio", { name: "Business Status - Starting" }));
        await page.visitStep(2);
        page.selectByValue("Industry", "cannabis");
        await page.visitStep(3);
        expect(currentUserData().profileData.cannabisLicenseType).toEqual("CONDITIONAL");
      });

      it("allows switching cannabis license type to ANNUAL", async () => {
        const { page } = renderPage({});

        fireEvent.click(screen.getByRole("radio", { name: "Business Status - Starting" }));
        await page.visitStep(2);
        page.selectByValue("Industry", "cannabis");
        page.chooseRadio("cannabis-license-annual");
        await page.visitStep(3);
        expect(currentUserData().profileData.cannabisLicenseType).toEqual("ANNUAL");
      });

      it("sets cannabis license type to back undefined when switching back to non-cannabis industry", async () => {
        const { page } = renderPage({});

        fireEvent.click(screen.getByRole("radio", { name: "Business Status - Starting" }));
        await page.visitStep(2);
        expect(currentUserData().profileData.cannabisLicenseType).toBeUndefined();
        page.selectByValue("Industry", "cannabis");
        await page.visitStep(3);
        expect(currentUserData().profileData.cannabisLicenseType).toEqual("CONDITIONAL");
        act(() => page.clickBack());
        page.selectByValue("Industry", "generic");
        await page.visitStep(3);
        expect(currentUserData().profileData.cannabisLicenseType).toBeUndefined();
      });
    });
  });

  it("displays error message when @ is missing in email input field", async () => {
    useMockRouter({ isReady: true, query: { page: "5" } });
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
    useMockRouter({ isReady: true, query: { page: "5" } });
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

  describe("updates to industry affecting home-based business", () => {
    it("sets home-based business back to false if they select a non-applicable industry", async () => {
      const { page } = renderPage({});
      await selectInitialIndustry("home-contractor", page);
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
      await reselectNewIndustry("restaurant", page);
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(false);
    });

    it("sets home-based business back to true if they select an applicable industry", async () => {
      const { page } = renderPage({});
      await selectInitialIndustry("restaurant", page);
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(false);
      await reselectNewIndustry("e-commerce", page);
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
    });

    it("keeps home-based business value if they select a different but still applicable industry", async () => {
      const { page } = renderPage({});
      await selectInitialIndustry("e-commerce", page);
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
      await selectHomeBasedBusiness("false", page);
      await reselectNewIndustry("home-contractor", page);
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(false);
    });

    const selectInitialIndustry = async (industry: string, page: PageHelpers): Promise<void> => {
      page.chooseRadio("business-persona-starting");
      await page.visitStep(2);
      page.selectByValue("Industry", industry);

      await page.visitStep(3);
      page.chooseRadio("general-partnership");
    };

    const selectHomeBasedBusiness = async (value: string, page: PageHelpers): Promise<void> => {
      await page.visitStep(4);
      page.chooseRadio(`home-based-business-${value}`);
      page.clickBack();
    };

    const reselectNewIndustry = async (industry: string, page: PageHelpers): Promise<void> => {
      page.clickBack();
      page.selectByValue("Industry", industry);
      await page.visitStep(3);
    };
  });
});

import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { createEmptyLoadDisplayContent } from "@/lib/types/types";
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
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/";
import { render, RenderResult, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import React from "react";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postSelfReg: jest.fn(),
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const date = dayjs().subtract(1, "month").date(1);
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
    const { subject } = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("displays page one when a user goes to /onboarding", async () => {
    mockRouter.mockQuery.mockReturnValue({});
    const { subject } = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("pushes to page one when a user visits a page number above the valid page range", async () => {
    useMockRouter({ isReady: true, query: { page: "6" } });
    const { subject } = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("pushes to page one when a user visits a page number below the valid page range", async () => {
    useMockRouter({ isReady: true, query: { page: "0" } });
    const { subject } = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
  });

  it("builds and sets roadmap after each step", async () => {
    const profileData = generateProfileData({ hasExistingBusiness: false });
    const mockSetRoadmap = jest.fn();
    const user = generateUser({});
    const userData = generateUserData({ profileData: profileData, user });
    const subject = render(
      withRoadmap(
        withAuth(
          <WithStatefulUserData initialUserData={userData}>
            <Onboarding displayContent={createEmptyLoadDisplayContent()} municipalities={[]} />
          </WithStatefulUserData>,
          { user: user, isAuthenticated: IsAuthenticated.TRUE }
        ),
        undefined,
        undefined,
        mockSetRoadmap
      )
    );

    const page = createPageHelpers(subject);

    await page.visitStep2();
    expect(mockSetRoadmap).toHaveBeenCalledTimes(1);
    await page.visitStep3();
    expect(mockSetRoadmap).toHaveBeenCalledTimes(2);
    await page.visitStep4();
    expect(mockSetRoadmap).toHaveBeenCalledTimes(3);

    page.clickNext();
    await waitFor(() => expect(mockSetRoadmap).toHaveBeenCalledTimes(4));
  });

  it("generates a new empty userData object during guest checkout", async () => {
    renderPage({ userData: null, user: generateUser({}), isAuthenticated: IsAuthenticated.FALSE });
    expect(currentUserData().user);
  });

  it("updates locally for each step", async () => {
    const userData = generateUserData({});
    const { page } = renderPage({ userData });
    mockApi.postNewsletter.mockImplementation((request) => Promise.resolve(request));
    mockApi.postUserTesting.mockImplementation((request) => Promise.resolve(request));
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    expect(getLastCalledWithConfig().local).toEqual(true);
    await page.visitStep3();
    expect(getLastCalledWithConfig().local).toEqual(true);
    await page.visitStep4();
    expect(getLastCalledWithConfig().local).toEqual(true);
    await page.visitStep5();
    expect(getLastCalledWithConfig().local).toEqual(true);
    page.clickNext();
    await waitFor(() => expect(getLastCalledWithConfig().local).toEqual(true));
  });

  it("prevents user from moving after Step 1 if you have not selected whether you own a business", async () => {
    const { subject, page } = renderPage({});
    page.clickNext();
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_EXISTING_BUSINESS")).toBeInTheDocument();
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    expect(subject.queryByTestId("error-alert-REQUIRED_EXISTING_BUSINESS")).not.toBeInTheDocument();
  });

  it("sets initialOnboardingFlow if formProgress is not COMPLETED", async () => {
    const initialUserData = generateUserData({
      formProgress: "UNSTARTED",
      profileData: generateProfileData({ initialOnboardingFlow: "STARTING" }),
    });

    const { page } = renderPage({ userData: initialUserData });
    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    expect(currentUserData().profileData.initialOnboardingFlow).toEqual("OWNING");
  });

  it("preserves initialOnboardingFlow value if formProgress is COMPLETED", async () => {
    const initialUserData = generateUserData({
      formProgress: "COMPLETED",
      profileData: generateProfileData({ initialOnboardingFlow: "STARTING" }),
    });

    const { page } = renderPage({ userData: initialUserData });
    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    expect(currentUserData().profileData.initialOnboardingFlow).toEqual("STARTING");
  });

  it("is able to go back", async () => {
    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    expect(subject.queryByTestId("step-2")).toBeInTheDocument();
    page.clickBack();
    expect(subject.queryByTestId("step-1")).toBeInTheDocument();
  });

  it("resets non-shared information when switching from starting flow to owning flow", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const initialUserData = generateUserData({
      formProgress: "UNSTARTED",
      profileData: createEmptyProfileData(),
    });
    const { page } = renderPage({ municipalities: [newark], userData: initialUserData });

    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    page.selectByValue("Industry", "e-commerce");
    await page.visitStep3();
    page.chooseRadio("general-partnership");
    await page.visitStep4();
    page.selectByText("Location", "Newark");

    page.clickBack();
    page.clickBack();
    page.clickBack();

    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    expect(currentUserData().profileData).toEqual({
      ...initialUserData.profileData,
      hasExistingBusiness: true,
      entityId: undefined,
      businessName: "",
      initialOnboardingFlow: "OWNING",
      industryId: "generic",
      homeBasedBusiness: true,
      legalStructureId: undefined,
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

    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    page.selectDate("Date of formation", date);
    page.fillText("Entity id", "1234567890");
    await page.visitStep3();
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep4();
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");
    page.chooseRadio("home-based-business-true");

    page.clickBack();
    page.clickBack();
    page.clickBack();

    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    expect(currentUserData().profileData).toEqual({
      ...initialUserData.profileData,
      hasExistingBusiness: false,
      entityId: undefined,
      businessName: "Cool Computers",
      initialOnboardingFlow: "STARTING",
      industryId: undefined,
      homeBasedBusiness: true,
      dateOfFormation: undefined,
      legalStructureId: undefined,
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

    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    page.selectDate("Date of formation", date);
    page.fillText("Entity id", "1234567890");
    await page.visitStep3();
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Sector", "clean-energy");
    await page.visitStep4();
    page.selectByText("Location", "Newark");
    page.selectByValue("Ownership", "veteran-owned");
    page.chooseRadio("home-based-business-true");

    page.clickBack();
    page.clickBack();
    page.clickBack();

    await page.visitStep2();
    expect(currentUserData().profileData).toEqual({
      ...initialUserData.profileData,
      hasExistingBusiness: true,
      entityId: "1234567890",
      businessName: "Cool Computers",
      industryId: "generic",
      dateOfFormation: date.format("YYYY-MM-DD"),
      homeBasedBusiness: true,
      initialOnboardingFlow: "OWNING",
      municipality: newark,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      ownershipTypeIds: ["veteran-owned"],
      sectorId: "clean-energy",
    });
  });

  describe("when industry changes", () => {
    it("displays industry-specific content for home contractors when selected", async () => {
      const displayContent = createEmptyLoadDisplayContent()["STARTING"];
      displayContent.industryId.specificHomeContractorMd = "Learn more about home contractors!";

      const { subject, page } = renderPage({});

      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();
      expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
      page.selectByValue("Industry", "home-contractor");
      expect(subject.queryByText("Learn more about home contractors!")).toBeInTheDocument();

      await waitFor(() => {
        page.selectByValue("Industry", "e-commerce");
        expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
      });
    });

    it("displays industry-specific content for employment agency when selected", async () => {
      const displayContent = createEmptyLoadDisplayContent()["STARTING"];
      displayContent.industryId.specificEmploymentAgencyMd = "Learn more about employment agencies!";

      const { subject, page } = renderPage({});
      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();

      expect(subject.queryByText("Learn more about employment agencies!")).not.toBeInTheDocument();
      page.selectByValue("Industry", "employment-agency");
      expect(subject.queryByText("Learn more about employment agencies!")).toBeInTheDocument();

      await waitFor(() => {
        page.selectByValue("Industry", "e-commerce");
        expect(subject.queryByText("Learn more about employment agencies!")).not.toBeInTheDocument();
      });
    });

    it("displays liquor license question for restaurants when selected", async () => {
      const displayContent = createEmptyLoadDisplayContent()["STARTING"];
      displayContent.industryId.specificLiquorQuestion = {
        contentMd: "Do you need a liquor license?",
        radioButtonYesText: "Yeah",
        radioButtonNoText: "Nah",
      };

      const { subject, page } = renderPage({});
      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();

      expect(subject.queryByText("Do you need a liquor license?")).not.toBeInTheDocument();
      page.selectByValue("Industry", "restaurant");
      expect(subject.queryByText("Do you need a liquor license?")).toBeInTheDocument();
      page.chooseRadio("liquor-license-true");
      await page.visitStep3();

      expect(currentUserData().profileData.liquorLicense).toEqual(true);
    });

    describe("cannabis license type question", () => {
      let subject: RenderResult;
      let page: PageHelpers;

      beforeEach(async () => {
        const displayContent = createEmptyLoadDisplayContent()["STARTING"];
        displayContent.industryId.specificCannabisLicenseQuestion = {
          contentMd: "What type of cannabis license?",
          radioButtonConditionalText: "Conditional",
          radioButtonAnnualText: "Annual",
        };

        const result = renderPage({});
        page = result.page;
        subject = result.subject;

        page.chooseRadio("has-existing-business-false");
        await page.visitStep2();
      });

      it("displays cannabis license type question for cannabis only", async () => {
        expect(subject.queryByText("What type of cannabis license?")).not.toBeInTheDocument();
        page.selectByValue("Industry", "cannabis");
        expect(subject.queryByText("What type of cannabis license?")).toBeInTheDocument();

        page.selectByValue("Industry", "generic");
        expect(subject.queryByText("What type of cannabis license?")).not.toBeInTheDocument();
      });

      it("defaults cannabis license type to CONDITIONAL", async () => {
        page.selectByValue("Industry", "cannabis");
        await page.visitStep3();
        expect(currentUserData().profileData.cannabisLicenseType).toEqual("CONDITIONAL");
      });

      it("allows switching cannabis license type to ANNUAL", async () => {
        page.selectByValue("Industry", "cannabis");
        page.chooseRadio("cannabis-license-annual");
        await page.visitStep3();
        expect(currentUserData().profileData.cannabisLicenseType).toEqual("ANNUAL");
      });

      it("sets cannabis license type to back undefined when switching back to non-cannabis industru", async () => {
        expect(currentUserData().profileData.cannabisLicenseType).toBeUndefined();
        page.selectByValue("Industry", "cannabis");
        await page.visitStep3();
        expect(currentUserData().profileData.cannabisLicenseType).toEqual("CONDITIONAL");
        page.clickBack();
        page.selectByValue("Industry", "generic");
        await page.visitStep3();
        expect(currentUserData().profileData.cannabisLicenseType).toBeUndefined();
      });
    });

    it("displays home-based business question for applicable industries on municipality page", async () => {
      const newark = generateMunicipality({ displayName: "Newark" });
      const displayContent = createEmptyLoadDisplayContent();
      displayContent.STARTING.homeBased = {
        contentMd: "Are you a home-based business?",
        radioButtonYesText: "Yeah",
        radioButtonNoText: "Nah",
      };

      const { subject, page } = renderPage({ displayContent, municipalities: [newark] });

      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();
      page.selectByValue("Industry", "home-contractor");
      await page.visitStep3();
      page.chooseRadio("general-partnership");
      await page.visitStep4();
      page.selectByText("Location", "Newark");

      expect(subject.queryByText("Are you a home-based business?")).toBeInTheDocument();
      page.chooseRadio("home-based-business-true");

      page.clickNext();
      await waitFor(() => expect(currentUserData().profileData.homeBasedBusiness).toEqual(true));
    });

    it("does not display home-based business question for non-applicable industries", async () => {
      const displayContent = createEmptyLoadDisplayContent();
      displayContent.STARTING.homeBased.contentMd = "Are you a home-based business?";

      const { subject, page } = renderPage({ displayContent });
      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();

      page.selectByValue("Industry", "restaurant");
      await page.visitStep3();
      page.chooseRadio("general-partnership");
      await page.visitStep4();

      expect(subject.queryByText("Are you a home-based business?")).not.toBeInTheDocument();
    });

    it("sets liquor license back to false if they select a different industry", async () => {
      const { page } = renderPage({});
      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();

      page.selectByValue("Industry", "restaurant");
      page.chooseRadio("liquor-license-true");
      await page.visitStep3();
      expect(currentUserData().profileData.liquorLicense).toEqual(true);

      page.clickBack();
      page.selectByValue("Industry", "cosmetology");
      await page.visitStep3();
      expect(currentUserData().profileData.liquorLicense).toEqual(false);
    });

    it("sets sector for industry", async () => {
      const { page } = renderPage({});
      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();

      page.selectByValue("Industry", "restaurant");
      await page.visitStep3();
      expect(currentUserData().profileData.sectorId).toEqual("accommodation-and-food-services");

      page.clickBack();
      page.selectByValue("Industry", "cannabis");
      await page.visitStep3();
      expect(currentUserData().profileData.sectorId).toEqual("cannabis");
    });
  });

  it("displays error message when @ is missing in email input field", async () => {
    const { page, subject } = renderPage({
      userData: generateUserData({ user: generateUser({ email: `some-emailexample.com` }) }),
    });
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();
    await page.visitStep4();
    await page.visitStep5();
    page.clickNext();
    await waitFor(() => {
      expect(subject.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });
  });

  it("displays error message when . is missing in email input field", async () => {
    const { page, subject } = renderPage({
      userData: generateUserData({ user: generateUser({ email: `some-email@examplecom` }) }),
    });
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();
    await page.visitStep4();
    await page.visitStep5();
    page.clickNext();
    await waitFor(() => {
      expect(subject.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
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
      page.chooseRadio("has-existing-business-false");
      await page.visitStep2();
      page.selectByValue("Industry", industry);

      await page.visitStep3();
      page.chooseRadio("general-partnership");
    };

    const selectHomeBasedBusiness = async (value: string, page: PageHelpers): Promise<void> => {
      await page.visitStep4();
      page.chooseRadio(`home-based-business-${value}`);
      page.clickBack();
    };

    const reselectNewIndustry = async (industry: string, page: PageHelpers): Promise<void> => {
      page.clickBack();
      page.selectByValue("Industry", industry);
      await page.visitStep3();
    };
  });
});

import { render, waitFor } from "@testing-library/react";
import React from "react";
import Onboarding from "@/pages/onboarding";
import {
  generateMunicipality,
  generateProfileData as generateProfileData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  createEmptyProfileData,
  createEmptyProfileDisplayContent as createEmptyProfileDisplayContent,
  createEmptyUserData,
} from "@/lib/types/types";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { withRoadmap } from "@/test/helpers";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { createPageHelpers, PageHelpers, renderPage } from "@/test/pages/onboarding/helpers-onboarding";

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

describe("onboarding - shared", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();
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

    const subject = render(
      withRoadmap(
        <WithStatefulUserData initialUserData={generateUserData({ profileData: profileData })}>
          <Onboarding displayContent={createEmptyProfileDisplayContent()} municipalities={[]} />
        </WithStatefulUserData>,
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
    await page.visitStep5();
    expect(mockSetRoadmap).toHaveBeenCalledTimes(4);

    page.clickNext();
    await waitFor(() => expect(mockSetRoadmap).toHaveBeenCalledTimes(5));
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

  it("is able to go back", async () => {
    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    page.fillText("Business name", "Cool Computers");
    page.clickBack();
    expect(subject.queryByTestId("step-1")).toBeInTheDocument();
  });

  it("resets non-shared information when switching from starting flow to owning flow", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const initialUserData = generateUserData({ profileData: createEmptyProfileData() });
    const { page } = renderPage({ municipalities: [newark], userData: initialUserData });

    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    page.fillText("Business name", "Cool Computers");
    await page.visitStep3();
    page.selectByValue("Industry", "e-commerce");
    await page.visitStep4();
    page.chooseRadio("general-partnership");
    await page.visitStep5();
    page.selectByText("Location", "Newark");

    page.clickBack();
    page.clickBack();
    page.clickBack();
    page.clickBack();

    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    expect(currentUserData().profileData).toEqual({
      hasExistingBusiness: true,
      entityId: undefined,
      businessName: "Cool Computers",
      industryId: "e-commerce",
      homeBasedBusiness: true,
      legalStructureId: undefined,
      municipality: newark,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      certificationIds: [],
    });
  });

  it("resets non-shared information when switching from owning flow to starting flow", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const initialUserData = generateUserData({ profileData: createEmptyProfileData() });
    const { page } = renderPage({ municipalities: [newark], userData: initialUserData });

    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    page.fillText("Entity id", "1234567890");
    await page.visitStep3();
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Industry", "e-commerce");
    await page.visitStep4();
    page.selectByText("Location", "Newark");
    page.selectByValue("Certifications", "veteran-owned");

    page.clickBack();
    page.clickBack();
    page.clickBack();

    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    expect(currentUserData().profileData).toEqual({
      hasExistingBusiness: false,
      entityId: undefined,
      businessName: "Cool Computers",
      industryId: "e-commerce",
      homeBasedBusiness: true,
      legalStructureId: undefined,
      municipality: newark,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      certificationIds: [],
    });
  });

  it("does not reset information when re-visiting page 1 but not switching the answer", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const initialUserData = generateUserData({ profileData: createEmptyProfileData() });
    const { page } = renderPage({ municipalities: [newark], userData: initialUserData });

    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    page.fillText("Entity id", "1234567890");
    await page.visitStep3();
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Industry", "restaurant");
    await page.visitStep4();
    page.selectByText("Location", "Newark");
    page.selectByValue("Certifications", "veteran-owned");

    page.clickBack();
    page.clickBack();
    page.clickBack();

    await page.visitStep2();
    expect(currentUserData().profileData).toEqual({
      hasExistingBusiness: true,
      entityId: "1234567890",
      businessName: "Cool Computers",
      industryId: "restaurant",
      homeBasedBusiness: false,
      municipality: newark,
      liquorLicense: false,
      constructionRenovationPlan: undefined,
      employerId: undefined,
      taxId: undefined,
      notes: "",
      certificationIds: ["veteran-owned"],
    });
  });

  it("displays industry-specific content for home contractors when selected", async () => {
    const displayContent = createEmptyProfileDisplayContent();
    displayContent.industry.specificHomeContractorMd = "Learn more about home contractors!";

    const { subject, page } = renderPage({});

    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();

    expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
    page.selectByValue("Industry", "home-contractor");
    expect(subject.queryByText("Learn more about home contractors!")).toBeInTheDocument();

    await waitFor(() => {
      page.selectByValue("Industry", "e-commerce");
      expect(subject.queryByText("Learn more about home contractors!")).not.toBeInTheDocument();
    });
  });

  it("displays industry-specific content for employment agency when selected", async () => {
    const displayContent = createEmptyProfileDisplayContent();
    displayContent.industry.specificEmploymentAgencyMd = "Learn more about employment agencies!";

    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();

    expect(subject.queryByText("Learn more about employment agencies!")).not.toBeInTheDocument();
    page.selectByValue("Industry", "employment-agency");
    expect(subject.queryByText("Learn more about employment agencies!")).toBeInTheDocument();

    await waitFor(() => {
      page.selectByValue("Industry", "e-commerce");
      expect(subject.queryByText("Learn more about employment agencies!")).not.toBeInTheDocument();
    });
  });

  it("displays liquor license question for restaurants when selected", async () => {
    const displayContent = createEmptyProfileDisplayContent();
    displayContent.industry.specificLiquorQuestion = {
      contentMd: "Do you need a liquor license?",
      radioButtonYesText: "Yeah",
      radioButtonNoText: "Nah",
    };

    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();

    expect(subject.queryByText("Do you need a liquor license?")).not.toBeInTheDocument();
    page.selectByValue("Industry", "restaurant");
    expect(subject.queryByText("Do you need a liquor license?")).toBeInTheDocument();
    page.chooseRadio("liquor-license-true");
    await page.visitStep4();

    expect(currentUserData().profileData.liquorLicense).toEqual(true);
  });

  it("displays home-based business question for applicable industries on municipality page", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const displayContent = createEmptyProfileDisplayContent();

    displayContent.industry.specificHomeBasedBusinessQuestion = {
      contentMd: "Are you a home-based business?",
      radioButtonYesText: "Yeah",
      radioButtonNoText: "Nah",
    };

    const { subject, page } = renderPage({ displayContent, municipalities: [newark] });

    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();
    page.selectByValue("Industry", "home-contractor");
    await page.visitStep4();
    page.chooseRadio("general-partnership");
    await page.visitStep5();
    page.selectByText("Location", "Newark");

    expect(subject.queryByText("Are you a home-based business?")).toBeInTheDocument();
    page.chooseRadio("home-based-business-true");

    page.clickNext();
    await waitFor(() => expect(currentUserData().profileData.homeBasedBusiness).toEqual(true));
  });

  it("does not display home-based business question for non-applicable industries", async () => {
    const displayContent = createEmptyProfileDisplayContent();
    displayContent.industry.specificHomeBasedBusinessQuestion.contentMd = "Are you a home-based business?";

    const { subject, page } = renderPage({ displayContent });
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();

    page.selectByValue("Industry", "restaurant");
    await page.visitStep4();
    page.chooseRadio("general-partnership");
    await page.visitStep5();

    expect(subject.queryByText("Are you a home-based business?")).not.toBeInTheDocument();
  });

  it("sets liquor license back to false if they select a different industry", async () => {
    const { page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();

    page.selectByValue("Industry", "restaurant");
    page.chooseRadio("liquor-license-true");
    await page.visitStep4();
    expect(currentUserData().profileData.liquorLicense).toEqual(true);

    page.clickBack();
    page.selectByValue("Industry", "cosmetology");
    await page.visitStep4();
    expect(currentUserData().profileData.liquorLicense).toEqual(false);
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
      await page.visitStep3();

      page.selectByValue("Industry", industry);
      await page.visitStep4();
      page.chooseRadio("general-partnership");
    };

    const selectHomeBasedBusiness = async (value: string, page: PageHelpers): Promise<void> => {
      await page.visitStep5();
      page.chooseRadio(`home-based-business-${value}`);
      page.clickBack();
    };

    const reselectNewIndustry = async (industry: string, page: PageHelpers): Promise<void> => {
      page.clickBack();
      page.selectByValue("Industry", industry);
      await page.visitStep4();
    };
  });

  describe("owning a business feature flag", () => {
    it("only shows 4-step starting flow when disable feature flag is true", async () => {
      process.env.FEATURE_DISABLE_OSCAR_ONBOARDING = "true";

      const initialUserData = createEmptyUserData(generateUser({}));
      const newark = generateMunicipality({ displayName: "Newark" });
      const { page } = renderPage({ userData: initialUserData, municipalities: [newark] });

      page.fillText("Business name", "Cool Computers");

      await page.visitStep2();
      expect(currentUserData().profileData.businessName).toEqual("Cool Computers");
      page.selectByValue("Industry", "e-commerce");

      await page.visitStep3();
      expect(currentUserData().profileData.industryId).toEqual("e-commerce");
      expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);
      page.chooseRadio("general-partnership");

      await page.visitStep4();
      expect(currentUserData().profileData.legalStructureId).toEqual("general-partnership");
      page.selectByText("Location", "Newark");

      page.clickNext();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
      expect(currentUserData()).toEqual({
        ...initialUserData,
        formProgress: "COMPLETED",
        profileData: {
          ...initialUserData.profileData,
          hasExistingBusiness: false,
          businessName: "Cool Computers",
          industryId: "e-commerce",
          homeBasedBusiness: true,
          legalStructureId: "general-partnership",
          municipality: newark,
        },
      });

      process.env.FEATURE_DISABLE_OSCAR_ONBOARDING = undefined;
    });
  });
});

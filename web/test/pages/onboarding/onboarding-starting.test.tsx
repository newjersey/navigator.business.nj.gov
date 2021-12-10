import { waitFor } from "@testing-library/react";
import {
  generateMunicipality,
  generateProfileData as generateProfileData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import { createEmptyUserData } from "@businessnjgovnavigator/shared";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { templateEval } from "@/lib/utils/helpers";
import { renderPage } from "@/test/pages/onboarding/helpers-onboarding";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

describe("onboarding - starting a business", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  it("uses special template eval for step 1 label", async () => {
    const { subject, page } = renderPage({});
    expect(
      subject.getByText(templateEval(OnboardingDefaults.stepOneTemplate, { currentPage: "1" }))
    ).toBeInTheDocument();
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    expect(
      subject.getByText(
        templateEval(OnboardingDefaults.stepXofYTemplate, { currentPage: "2", totalPages: "5" })
      )
    ).toBeInTheDocument();
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    const { subject, page } = renderPage({});
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
    page.chooseRadio("has-existing-business-false");

    await page.visitStep2();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-2")).toBeInTheDocument();

    await page.visitStep3();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-3")).toBeInTheDocument();

    await page.visitStep4();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 4 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
    page.chooseRadio("general-partnership");

    await page.visitStep5();
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 5 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-5")).toBeInTheDocument();
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
    });

    const { page } = renderPage({ userData });
    expect(page.getRadioButtonValue()).toEqual("false");

    await page.visitStep2();
    expect(page.getBusinessNameValue()).toEqual("Applebees");

    await page.visitStep3();
    expect(page.getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);

    await page.visitStep4();
    expect(page.getRadioButtonValue()).toEqual("c-corporation");

    await page.visitStep5();
    expect(page.getMunicipalityValue()).toEqual("Newark");
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ userData: initialUserData, municipalities: [newark] });

    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    expect(currentUserData().profileData.hasExistingBusiness).toEqual(false);

    page.fillText("Business name", "Cool Computers");
    await page.visitStep3();
    expect(currentUserData().profileData.businessName).toEqual("Cool Computers");

    page.selectByValue("Industry", "e-commerce");
    await page.visitStep4();
    expect(currentUserData().profileData.industryId).toEqual("e-commerce");
    expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);

    page.chooseRadio("general-partnership");
    await page.visitStep5();
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
  });

  it("prevents user from moving after Step 4 if you have not selected a legal structure", async () => {
    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();
    await page.visitStep4();
    page.clickNext();
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
    expect(subject.queryByTestId("step-5")).not.toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    page.chooseRadio("general-partnership");
    await page.visitStep5();
    expect(subject.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
    expect(subject.getByTestId("step-5")).toBeInTheDocument();
    expect(subject.queryByTestId("step-4")).not.toBeInTheDocument();
  });

  it("prevents user from moving after Step 5 if you have not selected a location", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { subject, page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();
    await page.visitStep4();
    page.chooseRadio("general-partnership");
    await page.visitStep5();
    page.clickNext();
    await waitFor(() => {
      expect(subject.getByTestId("step-5")).toBeInTheDocument();
      expect(subject.queryByText(OnboardingDefaults.errorTextRequiredMunicipality)).toBeInTheDocument();
      expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });
    page.selectByText("Location", "Newark");
    page.clickNext();
    await waitFor(() => {
      expect(subject.queryByText(OnboardingDefaults.errorTextRequiredMunicipality)).not.toBeInTheDocument();
      expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
    });
  });

  it("removes required fields error when user goes back", async () => {
    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-false");
    await page.visitStep2();
    await page.visitStep3();
    await page.visitStep4();
    page.clickNext();
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_LEGAL")).toBeInTheDocument();
    page.clickBack();
    expect(subject.queryByTestId("error-alert-REQUIRED_LEGAL")).not.toBeInTheDocument();
  });
});

import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateMunicipality,
  generateProfileData as generateProfileData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import { renderPage } from "@/test/pages/onboarding/helpers-onboarding";
import { createEmptyUserData, LookupIndustryById } from "@businessnjgovnavigator/shared";
import { fireEvent, waitFor, within } from "@testing-library/react";

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

describe("onboarding - owning a business", () => {
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
    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    expect(
      subject.getByText(
        templateEval(OnboardingDefaults.stepXofYTemplate, { currentPage: "2", totalPages: "4" })
      )
    ).toBeInTheDocument();
  });

  it("changes url pathname every time a user goes to a different page", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const newark = generateMunicipality({ displayName: "Newark" });
    const { subject, page } = renderPage({ userData: initialUserData, municipalities: [newark] });

    page.chooseRadio("has-existing-business-true");
    expect(subject.getByTestId("step-1")).toBeInTheDocument();

    await page.visitStep2();
    page.fillText("Entity id", "1234567890");
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 2 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-2")).toBeInTheDocument();

    await page.visitStep3();
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Industry", "e-commerce");
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 3 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-3")).toBeInTheDocument();

    await page.visitStep4();
    page.selectByText("Location", "Newark");
    expect(mockRouter.mockPush).toHaveBeenCalledWith({ query: { page: 4 } }, undefined, { shallow: true });
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
  });

  it("shows correct next-button text on each page", async () => {
    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-true");
    const page1 = within(subject.getByTestId("page-1-form"));
    expect(page1.queryByText(OnboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page1.queryByText(OnboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep2();
    const page2 = within(subject.getByTestId("page-2-form"));
    expect(page2.queryByText(OnboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page2.queryByText(OnboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep3();
    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Industry", "e-commerce");
    const page3 = within(subject.getByTestId("page-3-form"));
    expect(page3.queryByText(OnboardingDefaults.nextButtonText)).toBeInTheDocument();
    expect(page3.queryByText(OnboardingDefaults.finalNextButtonText)).not.toBeInTheDocument();

    await page.visitStep4();
    const page4 = within(subject.getByTestId("page-4-form"));
    expect(page4.queryByText(OnboardingDefaults.nextButtonText)).not.toBeInTheDocument();
    expect(page4.queryByText(OnboardingDefaults.finalNextButtonText)).toBeInTheDocument();
  });

  it("updates the user data after each form page", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const newark = generateMunicipality({ displayName: "Newark" });
    const { page } = renderPage({ userData: initialUserData, municipalities: [newark] });

    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    expect(currentUserData().profileData.hasExistingBusiness).toEqual(true);

    page.fillText("Entity id", "1234567890");
    await page.visitStep3();
    expect(currentUserData().profileData.entityId).toEqual("1234567890");

    page.fillText("Business name", "Cool Computers");
    page.selectByValue("Industry", "e-commerce");
    await page.visitStep4();
    expect(currentUserData().profileData.industryId).toEqual("e-commerce");
    expect(currentUserData().profileData.homeBasedBusiness).toEqual(true);

    page.fillText("Existing employees", "1234567");
    page.selectByText("Location", "Newark");
    page.selectByValue("Certifications", "veteran-owned");
    page.selectByValue("Certifications", "small-business-enterprise");
    page.clickNext();
    await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
    expect(currentUserData()).toEqual({
      ...initialUserData,
      formProgress: "COMPLETED",
      profileData: {
        ...initialUserData.profileData,
        hasExistingBusiness: true,
        businessName: "Cool Computers",
        industryId: "e-commerce",
        homeBasedBusiness: true,
        legalStructureId: undefined,
        municipality: newark,
        entityId: "1234567890",
        certificationIds: ["veteran-owned", "small-business-enterprise"],
        existingEmployees: "1234567",
      },
    });
  });

  it("prevents user from moving after Step 1 if you have not selected whether you own a business", async () => {
    const { subject, page } = renderPage({});
    page.clickNext();
    expect(subject.getByTestId("step-1")).toBeInTheDocument();
    expect(subject.queryByTestId("step-2")).not.toBeInTheDocument();
    expect(subject.getByTestId("error-alert-REQUIRED_EXISTING_BUSINESS")).toBeInTheDocument();
    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    expect(subject.queryByTestId("error-alert-REQUIRED_EXISTING_BUSINESS")).not.toBeInTheDocument();
    expect(subject.queryByTestId("step-2")).toBeInTheDocument();
  });

  it("prevents user from moving after Step 2 if your entity id is invalid", async () => {
    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    page.fillText("Entity id", "123");
    fireEvent.blur(subject.getByLabelText("Entity id"));
    page.clickNext();
    await waitFor(() => {
      expect(subject.getByTestId("step-2")).toBeInTheDocument();
      expect(subject.queryByTestId("step-3")).not.toBeInTheDocument();
      expect(
        subject.getByText(templateEval(OnboardingDefaults.errorTextMinimumNumericField, { length: "10" }))
      ).toBeInTheDocument();
      expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });
    page.fillText("Entity id", "1234567890");
    await page.visitStep3();

    await waitFor(() => {
      expect(
        subject.queryByText(templateEval(OnboardingDefaults.errorTextMinimumNumericField, { length: "10" }))
      ).not.toBeInTheDocument();
      expect(subject.getByTestId("step-3")).toBeInTheDocument();
      expect(subject.queryByTestId("step-2")).not.toBeInTheDocument();
      expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
    });
  });

  it("prevents user from moving after Step 3 if you have not entered a business name", async () => {
    const { subject, page } = renderPage({});
    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    await page.visitStep3();
    page.clickNext();
    await waitFor(() => {
      expect(subject.getByTestId("step-3")).toBeInTheDocument();
      expect(subject.queryByTestId("step-4")).not.toBeInTheDocument();
      expect(subject.queryByText(OnboardingDefaults.errorTextRequiredBusinessName)).toBeInTheDocument();
      expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });
    page.fillText("Business name", "A business");
    page.clickNext();

    await waitFor(() => {
      expect(subject.queryByText(OnboardingDefaults.errorTextRequiredBusinessName)).not.toBeInTheDocument();
      expect(subject.queryByTestId("toast-alert-ERROR")).not.toBeInTheDocument();
      expect(subject.queryByTestId("step-3")).not.toBeInTheDocument();
    });
  });

  it("prevents user from moving after Step 4 if you have not selected a location", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });
    const { subject, page } = renderPage({ municipalities: [newark] });
    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    await page.visitStep3();
    page.fillText("Business name", "A business");
    await page.visitStep4();
    page.fillText("Existing employees", "1234567");
    page.clickNext();
    await waitFor(() => {
      expect(subject.getByTestId("step-4")).toBeInTheDocument();
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

  it("prevents user from moving after Step 4 if you have not entered number of employees", async () => {
    const initialUserData = createEmptyUserData(generateUser({}));
    const newark = generateMunicipality({ displayName: "Newark" });
    const { subject, page } = renderPage({
      userData: initialUserData,
      municipalities: [newark],
    });

    page.chooseRadio("has-existing-business-true");
    await page.visitStep2();
    await page.visitStep3();
    page.fillText("Business name", "A business");

    await page.visitStep4();
    expect(subject.getByTestId("step-4")).toBeInTheDocument();
    page.selectByText("Location", "Newark");
    page.clickNext();

    await waitFor(() => {
      subject.getByText(OnboardingDefaults.errorTextRequiredExistingEmployees);
      expect(subject.queryByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });

    page.fillText("Existing employees", "123");
    page.clickNext();
    await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
  });

  it("prefills form from existing user data", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        hasExistingBusiness: true,
        entityId: "0123456789",
        businessName: "Applebees",
        industryId: "cosmetology",
        municipality: generateMunicipality({
          displayName: "Newark",
        }),
      }),
    });

    const { page } = renderPage({ userData });
    expect(page.getRadioButtonValue()).toEqual("true");

    await page.visitStep2();
    expect(page.getEntityIdValue()).toEqual("0123456789");

    await page.visitStep3();
    expect(page.getBusinessNameValue()).toEqual("Applebees");
    expect(page.getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);

    await page.visitStep4();
    expect(page.getMunicipalityValue()).toEqual("Newark");
  });
});

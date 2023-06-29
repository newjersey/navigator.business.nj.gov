import { TaxAccessStepTwo } from "@/components/filings-calendar/tax-access-modal/TaxAccessStepTwo";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { markdownToText, randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  createEmptyFormationFormData,
  FormationData,
  FormationLegalType,
  generateUserData,
  getCurrentDateISOString,
  OperatingPhases,
  UserData,
} from "@businessnjgovnavigator/shared";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateProfileData,
  generateTaxFilingData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postTaxFilingsOnboarding: jest.fn(),
  postTaxFilingsLookup: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();

const renderComponent = (initialUserData?: UserData): void => {
  render(
    <WithStatefulUserData initialUserData={initialUserData}>
      <TaxAccessStepTwo
        isOpen={true}
        close={(): void => {}}
        onSuccess={(): void => {}}
        moveToPrevStep={(): void => {}}
      />
    </WithStatefulUserData>
  );
};

describe("<TaxAccessStepTwo />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({ onboardingFormProgress: "COMPLETED" });
    setupStatefulUserDataContext();
  });

  const generateTaxFilingUserData = (params: {
    publicFiling: boolean;
    formedInNavigator?: boolean;
    businessName?: string;
    responsibleOwnerName?: string;
    taxId?: string;
  }): UserData => {
    const legalStructureId = randomLegalStructure({ requiresPublicFiling: params.publicFiling }).id;

    let formationData: FormationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    };

    if (params.publicFiling) {
      formationData = generateFormationData(
        {
          completedFilingPayment: !!params.formedInNavigator,
          getFilingResponse: generateGetFilingResponse({ success: params.formedInNavigator }),
        },
        legalStructureId as FormationLegalType
      );
    }

    return generateUserData({
      profileData: generateProfileData({
        legalStructureId: legalStructureId,
        operatingPhase: randomElementFromArray(
          OperatingPhases.filter((obj) => {
            return obj.displayTaxAccessButton;
          })
        ).id,
        taxId: params.taxId ? `*${params.taxId.slice(1)}` : "",
        encryptedTaxId: params.taxId ? `encrypted-${params.taxId}` : "",
        businessName: params.businessName || "",
        responsibleOwnerName: params.responsibleOwnerName || "",
      }),
      formationData: formationData,
      taxFilingData: generateTaxFilingData({ state: undefined }),
    });
  };

  describe("when PublicFiling", () => {
    const userDataWithPrefilledFields = generateTaxFilingUserData({
      publicFiling: true,
      taxId: "123456789123",
      businessName: "MrFakesHotDogBonanza",
    });

    const userDataMissingTaxId = generateTaxFilingUserData({
      publicFiling: true,
      taxId: "",
      businessName: "MrFakesHotDogBonanza",
    });

    const userDataMissingBusinessName = generateTaxFilingUserData({
      publicFiling: true,
      taxId: "123456789123",
      businessName: "",
    });

    const taxIdDisplayFormat = "*23-456-789/123";

    sharedTestsWhenAllFieldsPrefilled(userDataWithPrefilledFields);

    it("pre-populates fields with userData values", () => {
      renderComponent(userDataWithPrefilledFields);
      expect((screen.queryByLabelText("Business name") as HTMLInputElement)?.value).toEqual(
        "MrFakesHotDogBonanza"
      );
      expect((screen.queryByLabelText("Tax id") as HTMLInputElement)?.value).toEqual(taxIdDisplayFormat);
    });

    it("does not show disclaimer text for TaxId", () => {
      renderComponent(userDataWithPrefilledFields);
      const taxInput = screen.getByTestId("taxIdInput");
      expect(within(taxInput).getByTestId("description")).toBeInTheDocument();
      expect(within(taxInput).queryByTestId("postDescription")).not.toBeInTheDocument();
    });

    it("does not lock businessName even if they have completed formation with us", () => {
      const userDataWithNavigatorFormation = generateTaxFilingUserData({
        publicFiling: true,
        formedInNavigator: true,
        taxId: "123456789123",
        businessName: "MrFakesHotDogBonanza",
      });

      renderComponent(userDataWithNavigatorFormation);

      expect(screen.getByText(markdownToText(Config.taxAccess.modalBusinessFieldHeader))).toBeInTheDocument();
      fireEvent.change(screen.getByTestId("businessName"), { target: { value: "MrFakesHotDogBonanza" } });
    });

    it("updates taxId but not businessName on submit", async () => {
      renderComponent(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        profileData: {
          ...userDataWithPrefilledFields.profileData,
        },
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          businessName: userDataWithPrefilledFields.profileData.businessName,
          errorField: undefined,
        }),
      });
      fireEvent.change(screen.getByLabelText("Business name"), {
        target: { value: "zoom" },
      });
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "999888777666" },
      });
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().profileData.businessName).not.toEqual("zoom");
      });
      return expect(currentUserData().profileData.taxId).toEqual("999888777666");
      return expect(currentUserData().profileData.encryptedTaxId).toEqual(undefined);
    });

    it("updates businessName on submit if tax filing is success", async () => {
      renderComponent(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        profileData: {
          ...userDataWithPrefilledFields.profileData,
          municipality: undefined,
        },
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          businessName: userDataWithPrefilledFields.profileData.businessName,
          errorField: undefined,
        }),
      });
      fireEvent.change(screen.getByLabelText("Business name"), {
        target: { value: "zoom" },
      });
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "999888777666" },
      });
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().profileData.businessName).toEqual("zoom");
      });
      return expect(currentUserData().profileData.taxId).toEqual("999888777666");
      return expect(currentUserData().profileData.encryptedTaxId).toEqual(undefined);
    });

    it("displays in-line error and alert when businessName field is empty and save button is clicked", async () => {
      renderComponent(userDataMissingBusinessName);
      clickSave();
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toEqual(true);
      });
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.stepTwoErrorBanner);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalBusinessFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxAccess.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        Config.taxAccess.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByText(Config.taxAccess.failedBusinessFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedTaxIdHelper)).not.toBeInTheDocument();
      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays in-line error and alert when taxId field is empty and save button is clicked", async () => {
      renderComponent(userDataMissingTaxId);
      clickSave();
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toEqual(true);
      });
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.stepTwoErrorBanner);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxAccess.modalBusinessFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        Config.taxAccess.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.queryByText(Config.taxAccess.failedBusinessFieldHelper)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedTaxIdHelper)).toBeInTheDocument();
      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays in-line error and alert when businessName field and taxId field is invalid and save button is clicked", async () => {
      const userDataMissingBoth = generateTaxFilingUserData({
        publicFiling: true,
        taxId: "123",
        businessName: "",
      });

      renderComponent(userDataMissingBoth);
      clickSave();
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toEqual(true);
      });
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.stepTwoErrorBanner);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalBusinessFieldErrorName);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        Config.taxAccess.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByText(Config.taxAccess.failedBusinessFieldHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedTaxIdHelper)).toBeInTheDocument();
      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays inline errors when api failed", async () => {
      renderComponent(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithPrefilledFields,
          taxFilingData: generateTaxFilingData({ state: "FAILED", errorField: undefined }),
          profileData: {
            ...userDataWithPrefilledFields.profileData,
          },
        });
      });
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("FAILED");
      });
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.failedErrorMessageHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalBusinessFieldErrorName);
      expect(screen.getByText(Config.taxAccess.failedTaxIdHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedBusinessFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)).not.toBeInTheDocument();
    });

    it("states business name specific field error in alert if api fails", async () => {
      renderComponent(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithPrefilledFields,
          taxFilingData: generateTaxFilingData({ state: "FAILED", errorField: "businessName" }),
          profileData: {
            ...userDataWithPrefilledFields.profileData,
          },
        });
      });
      clickSave();
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.failedErrorMessageHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalBusinessFieldErrorName);
      expect(screen.getByText(Config.taxAccess.failedBusinessFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedTaxIdHelper)).not.toBeInTheDocument();
    });

    it("displays error when the businessName field is empty on blur", () => {
      renderComponent(userDataWithPrefilledFields);
      fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "" } });
      fireEvent.blur(screen.getByLabelText("Business name"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedBusinessFieldHelper)).toBeInTheDocument();
    });

    it("submits taxId and businessName to api", async () => {
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
      });
      renderComponent(userDataWithPrefilledFields);
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      expect(mockApi.postTaxFilingsOnboarding).toHaveBeenCalledWith({
        taxId: userDataWithPrefilledFields.profileData.taxId,
        businessName: userDataWithPrefilledFields.profileData.businessName,
        encryptedTaxId: userDataWithPrefilledFields.profileData.encryptedTaxId,
      });
    });

    it("marks the naics code task as complete on successful response", async () => {
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
        profileData: {
          ...userDataWithPrefilledFields.profileData,
          municipality: {
            name: "Absecon",
            displayName: "",
            county: "",
            id: "",
          },
          naicsCode: "123456",
        },
      });

      renderComponent(userDataWithPrefilledFields);
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      await waitFor(() => {
        return expect(currentUserData().taskProgress["determine-naics-code"]).toEqual("COMPLETED");
      });
    });
  });

  describe("when TradeName", () => {
    const userDataWithPrefilledFields = generateTaxFilingUserData({
      publicFiling: false,
      taxId: "123456789123",
      responsibleOwnerName: "FirstName LastName",
    });

    const userDataMissingTaxId = generateTaxFilingUserData({
      publicFiling: false,
      taxId: "",
      responsibleOwnerName: "FirstName LastName",
    });

    const userDataMissingResponsibleOwnerName = generateTaxFilingUserData({
      publicFiling: false,
      taxId: "123456789123",
      responsibleOwnerName: "",
    });

    const taxIdDisplayFormat = "*23-456-789/123";

    sharedTestsWhenAllFieldsPrefilled(userDataWithPrefilledFields);

    it("pre-populates fields with userData values", () => {
      renderComponent(userDataWithPrefilledFields);
      expect((screen.queryByLabelText("Responsible owner name") as HTMLInputElement)?.value).toEqual(
        "FirstName LastName"
      );
      expect((screen.queryByLabelText("Tax id") as HTMLInputElement)?.value).toEqual(taxIdDisplayFormat);
    });

    it("shows disclaimer text for TaxId", () => {
      renderComponent(userDataWithPrefilledFields);
      expect(screen.getByText(Config.taxAccess.modalHeader)).toBeInTheDocument();

      const taxInput = screen.getByTestId("taxIdInput");
      expect(within(taxInput).getByTestId("description")).toBeInTheDocument();
      expect(within(taxInput).getByTestId("postDescription")).toBeInTheDocument();
    });

    it("updates taxId and responsibleOwnerName on submit", async () => {
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
        }),
      });

      renderComponent(userDataWithPrefilledFields);

      fireEvent.change(screen.getByLabelText("Responsible owner name"), {
        target: { value: "zoom" },
      });
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789000" },
      });
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().profileData.responsibleOwnerName).toEqual("zoom");
      });
      await waitFor(() => {
        return expect(currentUserData().profileData.taxId).toEqual("123456789000");
      });
    });

    it("displays in-line error and alert when responsibleOwnerName field is empty and save button is clicked", () => {
      renderComponent(userDataMissingResponsibleOwnerName);
      clickSave();

      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.stepTwoErrorBanner);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.taxAccess.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxAccess.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxAccess.modalBusinessFieldErrorName);

      expect(screen.getByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedTaxIdHelper)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedBusinessFieldHelper)).not.toBeInTheDocument();

      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays in-line error and alert when taxId field is empty and save button is clicked", () => {
      renderComponent(userDataMissingTaxId);
      clickSave();
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.stepTwoErrorBanner);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxAccess.modalBusinessFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        Config.taxAccess.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.queryByText(Config.taxAccess.failedBusinessFieldHelper)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedTaxIdHelper)).toBeInTheDocument();
      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays in-line error and alert when responsibleOwnerName field and taxId field is invalid and save button is clicked", () => {
      const userDataMissingBoth = generateTaxFilingUserData({
        publicFiling: false,
        taxId: "",
        responsibleOwnerName: "",
      });

      renderComponent(userDataMissingBoth);
      clickSave();
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.stepTwoErrorBanner);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.taxAccess.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxAccess.modalBusinessFieldErrorName);

      expect(screen.getByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedTaxIdHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedBusinessFieldHelper)).not.toBeInTheDocument();

      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays error when the responsibleOwnerName field is empty on blur", () => {
      renderComponent(userDataWithPrefilledFields);
      fireEvent.change(screen.getByLabelText("Responsible owner name"), { target: { value: "" } });
      fireEvent.blur(screen.getByLabelText("Responsible owner name"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
    });

    it("displays alert & inline errors when api failed", async () => {
      renderComponent(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithPrefilledFields,
          taxFilingData: generateTaxFilingData({ state: "FAILED", errorField: undefined }),
          profileData: {
            ...userDataWithPrefilledFields.profileData,
          },
        });
      });
      clickSave();
      await screen.findByRole("alert");

      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.taxAccess.failedErrorMessageHeader)
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.taxAccess.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.modalTaxFieldErrorName);
      expect(screen.getByText(Config.taxAccess.failedTaxIdHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedBusinessFieldHelper)).not.toBeInTheDocument();
    });

    it("states responsible owner name specific field error in alert if api fails", async () => {
      renderComponent(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithPrefilledFields,
          taxFilingData: generateTaxFilingData({ state: "FAILED", errorField: "businessName" }),
          profileData: {
            ...userDataWithPrefilledFields.profileData,
          },
        });
      });
      clickSave();
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxAccess.failedErrorMessageHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.taxAccess.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxAccess.failedBusinessFieldHelper)).not.toBeInTheDocument();
    });

    it("submits taxId and responsibleOwnerName to api", async () => {
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
        profileData: {
          ...userDataWithPrefilledFields.profileData,
          municipality: {
            name: "Absecon",
            displayName: "",
            county: "",
            id: "",
          },
          naicsCode: "123456",
        },
      });

      renderComponent(userDataWithPrefilledFields);
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      expect(mockApi.postTaxFilingsOnboarding).toHaveBeenCalledWith({
        taxId: userDataWithPrefilledFields.profileData.taxId,
        businessName: userDataWithPrefilledFields.profileData.responsibleOwnerName,
        encryptedTaxId: userDataWithPrefilledFields.profileData.encryptedTaxId,
      });
    });

    it("updates naics code and marks the naics code task as complete on successful response", async () => {
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
        profileData: {
          ...userDataWithPrefilledFields.profileData,
          naicsCode: "123456",
        },
      });

      renderComponent(userDataWithPrefilledFields);
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      await waitFor(() => {
        return expect(currentUserData().taskProgress["determine-naics-code"]).toEqual("COMPLETED");
      });
    });

    it("updates municipality from the API on successful response", async () => {
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
        profileData: {
          ...userDataWithPrefilledFields.profileData,
          municipality: {
            name: "testville",
            displayName: "Testville",
            county: "testCounty",
            id: "testville-id",
          },
        },
      });

      renderComponent(userDataWithPrefilledFields);
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      expect(currentUserData().taskProgress["determine-naics-code"]).toEqual("COMPLETED");
      expect(currentUserData().profileData.municipality).toEqual({
        name: "testville",
        displayName: "Testville",
        county: "testCounty",
        id: "testville-id",
      });
    });
  });

  function sharedTestsWhenAllFieldsPrefilled(userData: UserData): void {
    it("displays error when the taxId field is empty on blur", () => {
      renderComponent(userData);
      fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "" } });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxAccess.failedTaxIdHelper)).toBeInTheDocument();
    });

    it("succeeds with 9-digit split-field tax id", async () => {
      renderComponent({
        ...userData,
        profileData: {
          ...userData.profileData,
          taxId: "123456789",
        },
      });

      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
      });

      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), { target: { value: "123" } });
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
    });

    describe("on api failed state response", () => {
      it("displays unknown-error alert with unknown api error", async () => {
        renderComponent(userData);
        mockApi.postTaxFilingsOnboarding.mockResolvedValue({
          ...userData,
          taxFilingData: generateTaxFilingData({
            state: "API_ERROR",
          }),
        });
        clickSave();
        await screen.findByRole("alert");
        expect(screen.getByRole("alert")).toHaveTextContent(
          markdownToText(Config.taxAccess.failedUnknownMarkdown)
        );
        expect(screen.queryByText(Config.taxAccess.failedBusinessFieldHelper)).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(Config.taxAccess.failedTaxIdHelper)).not.toBeInTheDocument();
      });

      it("displays unknown-error alert with api 500 request failure", async () => {
        renderComponent(userData);
        mockApi.postTaxFilingsOnboarding.mockReturnValue(Promise.reject(500));
        clickSave();
        await screen.findByRole("alert");
        expect(screen.getByRole("alert")).toHaveTextContent(
          markdownToText(Config.taxAccess.failedUnknownMarkdown)
        );
        expect(screen.queryByText(Config.taxAccess.failedBusinessFieldHelper)).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.taxAccess.failedResponsibleOwnerFieldHelper)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(Config.taxAccess.failedTaxIdHelper)).not.toBeInTheDocument();
      });
    });
  }

  const clickSave = (): void => {
    fireEvent.click(screen.getByTestId("modal-button-primary"));
  };
});

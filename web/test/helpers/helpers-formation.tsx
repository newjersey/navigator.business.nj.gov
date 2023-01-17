import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { LookupNexusStepIndexByName } from "@/components/tasks/business-formation/NexusFormationStepsConfiguration";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  defaultDisplayDateFormat,
  FormationSignedAddress,
  NameAvailability,
  Task,
  TasksDisplayContent,
} from "@/lib/types/types";
import {
  generateFormationData,
  generateNameAvailability,
  generateProfileData,
  generateTask,
  generateUserData,
  randomPublicFilingLegalType,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  castPublicFilingLegalTypeToFormationType,
  createEmptyFormationFormData,
  DateObject,
  FormationSubmitResponse,
  generateFormationIncorporator,
  generateMunicipality,
  Municipality,
  ProfileData,
  PublicFilingLegalType,
  publicFilingLegalTypes,
  randomInt,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

export function flushPromises() {
  return new Promise((resolve) => {
    return process.nextTick(resolve);
  });
}

export const generateFormationProfileData = (data: Partial<ProfileData>): ProfileData => {
  return generateProfileData({
    legalStructureId: randomPublicFilingLegalType(),
    businessPersona: "STARTING",
    ...data,
  });
};

export const useSetupInitialMocks = () => {
  useMockRoadmap({});
  useMockRouter({});
  setupStatefulUserDataContext();
  useMockDocuments({});
  mockApiResponse();
  setDesktopScreen(true);
};

export const preparePage = (
  userData: Partial<UserData>,
  displayContent: TasksDisplayContent,
  municipalities?: Municipality[],
  task?: Task,
  isAuthenticated?: IsAuthenticated,
  setRegistrationModalIsVisible?: (value: boolean) => void
): FormationPageHelpers => {
  const profileData = generateFormationProfileData({ ...userData.profileData });
  const isValid = publicFilingLegalTypes.includes(profileData.legalStructureId as PublicFilingLegalType);
  const initialUserData = generateUserData({
    ...userData,
    profileData,
    formationData: isValid
      ? generateFormationData(
          { ...userData.formationData },
          castPublicFilingLegalTypeToFormationType(
            profileData.legalStructureId as PublicFilingLegalType,
            profileData.businessPersona
          )
        )
      : generateFormationData({
          ...userData.formationData,
          formationFormData: createEmptyFormationFormData(),
        }),
  });
  const internalMunicipalities = [
    profileData?.municipality ?? generateMunicipality({ displayName: "GenericTown" }),
    ...(municipalities ?? []),
  ];
  initialUserData.formationData.formationFormData.addressMunicipality &&
    internalMunicipalities.push(initialUserData.formationData.formationFormData.addressMunicipality);
  initialUserData.formationData.formationFormData.agentOfficeAddressMunicipality &&
    internalMunicipalities.push(
      initialUserData.formationData.formationFormData.agentOfficeAddressMunicipality
    );
  render(
    withAuthAlert(
      <MunicipalitiesContext.Provider value={{ municipalities: internalMunicipalities }}>
        <WithStatefulUserData initialUserData={initialUserData}>
          <ThemeProvider theme={createTheme()}>
            <BusinessFormation task={task ?? generateTask({})} displayContent={displayContent} />
          </ThemeProvider>
        </WithStatefulUserData>
      </MunicipalitiesContext.Provider>,
      isAuthenticated ?? IsAuthenticated.TRUE,
      {
        registrationModalIsVisible: false,
        setRegistrationModalIsVisible: setRegistrationModalIsVisible ?? jest.fn(),
      }
    )
  );
  return createFormationPageHelpers();
};

export const mockApiResponse = (response?: FormationSubmitResponse) => {
  const mockApi = api as jest.Mocked<typeof api>;
  mockApi.postBusinessFormation.mockImplementation((userData) => {
    return Promise.resolve({
      ...userData,
      formationData: {
        ...userData.formationData,
        formationResponse: response,
      },
    });
  });
};

export const setDesktopScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => {
    return value;
  });
};

export type FormationPageHelpers = {
  fillText: (label: string, value: string) => void;
  fillAndSubmitBusinessNameStep: (businessName?: string) => Promise<void>;
  completeRequiredBillingFields: () => void;
  submitBusinessNameStep: () => Promise<void>;
  submitNexusBusinessNameStep: () => Promise<void>;
  fillAndSubmitNexusBusinessNameStep: (businessName?: string) => Promise<void>;
  submitBusinessStep: (completed?: boolean) => Promise<void>;
  submitContactsStep: (completed?: boolean) => Promise<void>;
  submitBillingStep: () => Promise<void>;
  submitReviewStep: () => Promise<void>;
  stepperClickToBusinessNameStep: () => Promise<void>;
  stepperClickToNexusBusinessNameStep: () => Promise<void>;
  stepperClickToBusinessStep: () => Promise<void>;
  stepperClickToContactsStep: () => Promise<void>;
  stepperClickToBillingStep: () => Promise<void>;
  stepperClickToReviewStep: () => Promise<void>;
  getStepStateInStepper: (index: number | undefined) => string;
  searchBusinessName: (nameAvailability: Partial<NameAvailability>) => Promise<void>;
  searchBusinessNameAndGetError: (errorCode?: number) => Promise<void>;
  chooseRadio: (value: string) => void;
  getInputElementByLabel: (label: string) => HTMLInputElement;
  getInputElementByTestId: (testId: string) => HTMLInputElement;
  selectByText: (label: string, value: string) => void;
  selectCheckbox: (label: string) => void;
  clickAddNewSigner: () => void;
  getSignerBox: (index: number, type: "signers" | "incorporators") => boolean;
  checkSignerBox: (index: number, type: "signers" | "incorporators") => void;
  clickAddressSubmit: () => void;
  openAddressModal: (fieldName: string) => Promise<void>;
  fillAddressModal: (overrides: Partial<FormationSignedAddress>) => Promise<void>;
  fillAndSubmitAddressModal: (overrides: Partial<FormationSignedAddress>, fieldName: string) => Promise<void>;
  clickSubmit: () => Promise<void>;
  selectDate: (value: DateObject, fieldType: "Business start date" | "Foreign date of formation") => void;
};

export const createFormationPageHelpers = (): FormationPageHelpers => {
  const mockApi = api as jest.Mocked<typeof api>;

  const fillText = (label: string, value: string) => {
    const item = screen.getByLabelText(label);
    fireEvent.change(item, { target: { value: value } });
    fireEvent.blur(item);
  };

  const fillAndSubmitBusinessNameStep = async (businessName = "Default Test Name"): Promise<void> => {
    fillText("Search business name", businessName);
    await searchBusinessName({ status: "AVAILABLE" });

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.initialNextButtonText));

    await waitFor(() => {
      expect(screen.queryByTestId("business-step")).toBeInTheDocument();
    });
  };

  const submitNexusBusinessNameStep = async (): Promise<void> => {
    await searchBusinessName({ status: "AVAILABLE" });

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.initialNextNexusButtonText));

    await waitFor(() => {
      expect(screen.queryByTestId("business-step")).toBeInTheDocument();
    });
  };
  const fillAndSubmitNexusBusinessNameStep = async (businessName = "Default Test Name"): Promise<void> => {
    fillText("Search business name", businessName);
    await submitNexusBusinessNameStep();
  };

  const stepperClickToNexusBusinessNameStep = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId(`stepper-${LookupNexusStepIndexByName("Business Name")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("nexus-name-step")).toBeInTheDocument();
    });
  };

  const stepperClickToBusinessNameStep = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Name")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("business-name-step")).toBeInTheDocument();
    });
  };

  const stepperClickToBusinessStep = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Business")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("business-step")).toBeInTheDocument();
    });
  };

  const stepperClickToContactsStep = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Contacts")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("contacts-step")).toBeInTheDocument();
    });
  };

  const stepperClickToBillingStep = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Billing")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("billing-step")).toBeInTheDocument();
    });
  };

  const stepperClickToReviewStep = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Review")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("review-step")).toBeInTheDocument();
    });
  };

  const getStepStateInStepper = (index: number | undefined): string => {
    return screen.getByTestId(`stepper-${index}`).dataset.state || "";
  };

  const submitBusinessNameStep = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.initialNextButtonText));
    await waitFor(() => {
      expect(screen.queryByTestId("business-step")).toBeInTheDocument();
    });
  };

  const submitBusinessStep = async (completed = true): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.nextButtonText));

    await (completed
      ? waitFor(() => {
          expect(screen.queryByTestId("contacts-step")).toBeInTheDocument();
        })
      : waitFor(() => {
          expect(screen.queryByTestId("contacts-step")).not.toBeInTheDocument();
        }));
  };

  const submitContactsStep = async (completed = true): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.nextButtonText));

    if (completed) {
      await waitFor(() => {
        expect(screen.queryByTestId("billing-step")).toBeInTheDocument();
      });
    }
  };

  const submitBillingStep = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.nextButtonText));

    await waitFor(() => {
      expect(screen.queryByTestId("review-step")).toBeInTheDocument();
    });
  };

  const submitReviewStep = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const searchBusinessName = async (nameAvailability: Partial<NameAvailability>): Promise<void> => {
    const returnedPromise = Promise.resolve(generateNameAvailability(nameAvailability));
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(screen.getByText(Config.searchBusinessNameTask.searchButtonText));
    await act(() => {
      return returnedPromise.then();
    });
  };

  const searchBusinessNameAndGetError = async (errorCode = 500): Promise<void> => {
    const returnedPromise = Promise.reject(errorCode);
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(screen.getByText(Config.searchBusinessNameTask.searchButtonText));
    await act(() => {
      return returnedPromise.catch(() => {});
    });
  };

  const chooseRadio = (value: string): void => {
    fireEvent.click(screen.getByTestId(value));
  };

  const getInputElementByLabel = (label: string): HTMLInputElement => {
    return screen.getByLabelText(label) as HTMLInputElement;
  };

  const getInputElementByTestId = (testId: string): HTMLInputElement => {
    return screen.getByTestId(testId) as HTMLInputElement;
  };

  const selectByText = (label: string, value: string) => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const selectCheckbox = (label: string): void => {
    fireEvent.click(screen.getByLabelText(label));
  };

  const clickAddNewSigner = (): void => {
    fireEvent.click(
      screen.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
    );
  };

  const getSignerBox = (index: number, type: "signers" | "incorporators"): boolean => {
    const additionalSigner = within(screen.getByTestId(`${type}-${index}`));
    return (
      additionalSigner.getByLabelText(
        `${Config.businessFormationDefaults.signatureColumnLabel}*`
      ) as HTMLInputElement
    ).checked;
  };

  const checkSignerBox = (index: number, type: "signers" | "incorporators"): void => {
    const additionalSigner = within(screen.getByTestId(`${type}-${index}`));
    fireEvent.click(
      additionalSigner.getByLabelText(`${Config.businessFormationDefaults.signatureColumnLabel}*`)
    );
  };

  const clickAddressSubmit = (): void => {
    fireEvent.click(screen.getByTestId("modal-button-primary"));
  };

  const openAddressModal = async (fieldName = "members"): Promise<void> => {
    fireEvent.click(screen.getByTestId(`addresses-${fieldName}-newButtonText`));
    await waitFor(() => {
      expect(screen.getByTestId(`${fieldName}-address-modal`)).toBeInTheDocument();
    });
  };

  const fillAndSubmitAddressModal = async (overrides: Partial<FormationSignedAddress>, fieldName: string) => {
    await openAddressModal(fieldName);
    await fillAddressModal(overrides);
    clickAddressSubmit();
    await waitFor(() => {
      expect(screen.queryByTestId(`${fieldName}-address-modal`)).not.toBeInTheDocument();
    });
  };

  const fillAddressModal = async (overrides: Partial<FormationSignedAddress>): Promise<void> => {
    const member = generateFormationIncorporator({ ...overrides });
    fillText("Address name", member.name);
    fillText("Address line1", member.addressLine1);
    fillText("Address line2", member.addressLine2);
    member.addressCity && fillText("Address city", member.addressCity);
    member.addressState &&
      fillText("Address state", member.addressState[randomInt() % 2 ? "name" : "shortCode"]);
    fillText("Address zip code", member.addressZipCode);
  };

  const clickSubmit = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const selectDate = (value: DateObject, fieldType: "Business start date" | "Foreign date of formation") => {
    fillText(fieldType, value.format(defaultDisplayDateFormat));
    fireEvent.blur(screen.getByLabelText(fieldType));
  };

  const completeRequiredBillingFields = () => {
    fireEvent.click(screen.getByLabelText("Credit card"));
    fillText("Contact first name", "John");
    fillText("Contact last name", "Smith");
    fillText("Contact phone number", "1234567890");
  };

  return {
    fillText,
    fillAndSubmitBusinessNameStep,
    submitBusinessNameStep,
    submitBusinessStep,
    submitContactsStep,
    submitNexusBusinessNameStep,
    fillAndSubmitNexusBusinessNameStep,
    submitBillingStep,
    submitReviewStep,
    searchBusinessName,
    searchBusinessNameAndGetError,
    chooseRadio,
    stepperClickToNexusBusinessNameStep,
    getInputElementByLabel,
    selectByText,
    selectCheckbox,
    clickAddNewSigner,
    checkSignerBox,
    getSignerBox,
    clickAddressSubmit,
    openAddressModal,
    fillAddressModal,
    fillAndSubmitAddressModal,
    clickSubmit,
    selectDate,
    stepperClickToBusinessNameStep,
    getInputElementByTestId,
    stepperClickToBusinessStep,
    stepperClickToContactsStep,
    stepperClickToBillingStep,
    stepperClickToReviewStep,
    getStepStateInStepper,
    completeRequiredBillingFields,
  };
};

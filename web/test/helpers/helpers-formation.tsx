import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { LookupNexusStepIndexByName } from "@/components/tasks/business-formation/NexusFormationStepsConfiguration";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  defaultDisplayDateFormat,
  FormationSignedAddress,
  Task,
  TasksDisplayContent,
} from "@/lib/types/types";
import { generateTask, randomPublicFilingLegalType } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  Business,
  BusinessUser,
  castPublicFilingLegalTypeToFormationType,
  createEmptyFormationFormData,
  DateObject,
  FormationSubmitResponse,
  generateBusiness,
  generateBusinessNameAvailability,
  generateFormationIncorporator,
  generateMunicipality,
  generateUser,
  generateUserDataForBusiness,
  Municipality,
  NameAvailability,
  ProfileData,
  PublicFilingLegalType,
  publicFilingLegalTypes,
  randomInt,
  UserData,
} from "@businessnjgovnavigator/shared";
import {
  generateFormationData,
  generateProfileData,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const Config = getMergedConfig();

export function flushPromises(): Promise<void> {
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

export const useSetupInitialMocks = (): void => {
  useMockRoadmap({});
  useMockRouter({});
  setupStatefulUserDataContext();
  useMockDocuments({});
  mockApiResponse();
  setDesktopScreen(true);
};

type PreparePageParams = {
  business: Partial<Business>;
  displayContent: TasksDisplayContent;
  municipalities?: Municipality[];
  task?: Task;
  isAuthenticated?: IsAuthenticated;
  setShowNeedsAccountModal?: (value: boolean) => void;
  user?: Partial<BusinessUser>;
};

export const preparePage = ({
  business,
  displayContent,
  municipalities,
  task,
  isAuthenticated,
  setShowNeedsAccountModal,
  user,
}: PreparePageParams): FormationPageHelpers => {
  const profileData = generateFormationProfileData({ ...business.profileData });
  const isValid = publicFilingLegalTypes.includes(profileData.legalStructureId as PublicFilingLegalType);
  const initialBusiness = generateBusiness({
    ...business,
    profileData,
    formationData: isValid
      ? generateFormationData(
          { ...business.formationData },
          castPublicFilingLegalTypeToFormationType(
            profileData.legalStructureId as PublicFilingLegalType,
            profileData.businessPersona
          )
        )
      : generateFormationData({
          ...business.formationData,
          formationFormData: createEmptyFormationFormData(),
        }),
  });

  const internalMunicipalities = [
    profileData?.municipality ?? generateMunicipality({ displayName: "GenericTown" }),
    ...(municipalities ?? []),
  ];
  initialBusiness.formationData.formationFormData.addressMunicipality &&
    internalMunicipalities.push(initialBusiness.formationData.formationFormData.addressMunicipality);

  const userData = generateUserData({
    user: generateUser(user ?? {}),
    businesses: {
      [initialBusiness.id]: initialBusiness,
    },
    currentBusinessId: initialBusiness.id,
  });

  render(
    withNeedsAccountContext(
      <MunicipalitiesContext.Provider value={{ municipalities: internalMunicipalities }}>
        <WithStatefulUserData initialUserData={userData}>
          <ThemeProvider theme={createTheme()}>
            <BusinessFormation task={task ?? generateTask({})} displayContent={displayContent} />
          </ThemeProvider>
        </WithStatefulUserData>
      </MunicipalitiesContext.Provider>,
      isAuthenticated ?? IsAuthenticated.TRUE,
      {
        showNeedsAccountModal: false,
        setShowNeedsAccountModal: setShowNeedsAccountModal ?? vi.fn(),
      }
    )
  );
  return createFormationPageHelpers();
};

export const mockApiResponse = (response?: FormationSubmitResponse): void => {
  const mockApi = api as vi.Mocked<typeof api>;
  mockApi.postBusinessFormation.mockImplementation((userData: UserData) => {
    return Promise.resolve({
      ...userData,
      businesses: {
        ...userData.businesses,
        [userData.currentBusinessId]: {
          ...userData.businesses[userData.currentBusinessId],
          formationData: {
            ...userData.businesses[userData.currentBusinessId].formationData,
            formationResponse: response,
          },
        },
      },
    });
  });
};

export const setDesktopScreen = (value: boolean): void => {
  (useMediaQuery as vi.Mock).mockImplementation(() => {
    return value;
  });
};

interface OptionUserEvent {
  useUserEvent: boolean;
}

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
  clickSubmitAndGetError: (business: Business) => Promise<void>;
  stepperClickToBusinessNameStep: (eventConfig?: OptionUserEvent) => Promise<void>;
  stepperClickToNexusBusinessNameStep: (eventConfig?: OptionUserEvent) => Promise<void>;
  stepperClickToBusinessStep: (eventConfig?: OptionUserEvent) => Promise<void>;
  stepperClickToContactsStep: (eventConfig?: OptionUserEvent) => Promise<void>;
  stepperClickToBillingStep: (eventConfig?: OptionUserEvent) => Promise<void>;
  stepperClickToReviewStep: (eventConfig?: OptionUserEvent) => Promise<void>;
  getStepStateInStepper: (index: number | undefined) => string;
  searchBusinessName: (nameAvailability: Partial<NameAvailability>) => Promise<void>;
  fillAndBlurBusinessName: (businessName?: string) => Promise<void>;
  searchBusinessNameAndGetError: (errorCode?: number) => Promise<void>;
  chooseRadio: (value: string) => void;
  getInputElementByLabel: (label: string) => HTMLInputElement;
  getInputElementByTestId: (testId: string) => HTMLInputElement;
  getInputElementByParentTestId: (testId: string, params: { type: string }) => HTMLInputElement;
  getListBoxForInputElementByTestId: (testId: string) => Promise<HTMLInputElement>;
  selectByText: (label: string, value: string) => void;
  selectCheckbox: (label: string) => void;
  selectCheckboxByTestId: (testId: string) => void;
  clickAddNewSigner: () => void;
  clickAddNewIncorporator: () => void;
  getSignerBox: (index: number, type: "signers" | "incorporators") => boolean;
  checkSignerBox: (index: number, type: "signers" | "incorporators") => void;
  clickAddressSubmit: () => void;
  openAddressModal: (fieldName: string) => Promise<void>;
  fillAddressModal: (overrides: Partial<FormationSignedAddress>) => Promise<void>;
  fillAndSubmitAddressModal: (overrides: Partial<FormationSignedAddress>, fieldName: string) => Promise<void>;
  clickSubmit: () => Promise<void>;
  selectDate: (value: DateObject, fieldType: "Business start date" | "Foreign date of formation") => void;
  uploadFile: (file: File) => void;
  completeWillPracticeLaw: (response?: boolean) => void;
};

export const createFormationPageHelpers = (): FormationPageHelpers => {
  const mockApi = api as vi.Mocked<typeof api>;

  const fillText = (label: string, value: string): void => {
    const item = screen.getByLabelText(label);
    fireEvent.change(item, { target: { value: value } });
    fireEvent.blur(item);
  };

  const fillAndSubmitBusinessNameStep = async (businessName = "Default Test Name"): Promise<void> => {
    fillText("Search business name", businessName);
    await searchBusinessName({ status: "AVAILABLE" });

    fireEvent.click(screen.getByText(Config.formation.general.initialNextButtonText));

    await waitFor(() => {
      expect(screen.queryByTestId("business-step")).toBeInTheDocument();
    });
  };

  const fillAndBlurBusinessName = async (businessName = "Default Test Name"): Promise<void> => {
    fillText("Search business name", businessName);
    fireEvent.blur(screen.getByLabelText("Search business name"));
  };

  const submitNexusBusinessNameStep = async (): Promise<void> => {
    await searchBusinessName({ status: "AVAILABLE" });

    fireEvent.click(screen.getByText(Config.formation.general.initialNextNexusButtonText));

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

  const stepperClickToBusinessNameStep = async (eventConfig?: OptionUserEvent): Promise<void> => {
    eventConfig?.useUserEvent
      ? userEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Name")}`))
      : fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Name")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("business-name-step")).toBeInTheDocument();
    });
  };

  const stepperClickToBusinessStep = async (eventConfig?: OptionUserEvent): Promise<void> => {
    eventConfig?.useUserEvent
      ? userEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Business")}`))
      : fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Business")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("business-step")).toBeInTheDocument();
    });
  };

  const stepperClickToContactsStep = async (eventConfig?: OptionUserEvent): Promise<void> => {
    eventConfig?.useUserEvent
      ? userEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Contacts")}`))
      : fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Contacts")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("contacts-step")).toBeInTheDocument();
    });
  };

  const stepperClickToBillingStep = async (eventConfig?: OptionUserEvent): Promise<void> => {
    eventConfig?.useUserEvent
      ? userEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Billing")}`))
      : fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Billing")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("billing-step")).toBeInTheDocument();
    });
  };

  const stepperClickToReviewStep = async (eventConfig?: OptionUserEvent): Promise<void> => {
    eventConfig?.useUserEvent
      ? userEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Review")}`))
      : fireEvent.click(screen.getByTestId(`stepper-${LookupStepIndexByName("Review")}`));
    await waitFor(() => {
      expect(screen.queryByTestId("review-step")).toBeInTheDocument();
    });
  };

  const getStepStateInStepper = (index: number | undefined): string => {
    return screen.getByTestId(`stepper-${index}`).dataset.state || "";
  };

  const submitBusinessNameStep = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.formation.general.initialNextButtonText));
    await waitFor(() => {
      expect(screen.queryByTestId("business-step")).toBeInTheDocument();
    });
  };

  const submitBusinessStep = async (completed = true): Promise<void> => {
    fireEvent.click(screen.getByText(Config.formation.general.nextButtonText));

    await (completed
      ? waitFor(() => {
          expect(screen.queryByTestId("contacts-step")).toBeInTheDocument();
        })
      : waitFor(() => {
          expect(screen.queryByTestId("contacts-step")).not.toBeInTheDocument();
        }));
  };

  const submitContactsStep = async (completed = true): Promise<void> => {
    fireEvent.click(screen.getByText(Config.formation.general.nextButtonText));

    if (completed) {
      await waitFor(() => {
        expect(screen.queryByTestId("billing-step")).toBeInTheDocument();
      });
    }
  };

  const submitBillingStep = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.formation.general.nextButtonText));

    await waitFor(() => {
      expect(screen.queryByTestId("review-step")).toBeInTheDocument();
    });
  };

  const submitReviewStep = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.formation.general.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const clickSubmitAndGetError = async (business: Business): Promise<void> => {
    const returnedPromise = Promise.resolve(generateUserDataForBusiness(business));
    mockApi.postBusinessFormation.mockReturnValue(returnedPromise);
    fireEvent.click(screen.getByText(Config.formation.general.submitButtonText));
    await act(async () => {
      await returnedPromise.then();
    });
  };

  const searchBusinessName = async (nameAvailability: Partial<NameAvailability>): Promise<void> => {
    const returnedPromise = Promise.resolve(generateBusinessNameAvailability(nameAvailability));
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

  const chooseRadio = (testId: string): void => {
    fireEvent.click(screen.getByTestId(testId));
  };

  const getInputElementByLabel = (label: string): HTMLInputElement => {
    return screen.getByLabelText(label) as HTMLInputElement;
  };

  const getInputElementByTestId = (testId: string): HTMLInputElement => {
    return screen.getByTestId(testId) as HTMLInputElement;
  };

  const getInputElementByParentTestId = (testId: string, params: { type: string }): HTMLInputElement => {
    // eslint-disable-next-line testing-library/no-node-access
    return screen.getByTestId(testId).querySelector(`input[type="${params.type}"]`) as HTMLInputElement;
  };

  const selectByText = (label: string, value: string): void => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const selectCheckbox = (label: string): void => {
    fireEvent.click(screen.getByLabelText(label));
  };

  const selectCheckboxByTestId = (testId: string): void => {
    fireEvent.click(screen.getByTestId(testId));
  };

  const clickAddNewSigner = (): void => {
    fireEvent.click(screen.getByText(Config.formation.fields.signers.addButtonText));
  };

  const clickAddNewIncorporator = (): void => {
    fireEvent.click(screen.getByText(Config.formation.fields.incorporators.addButtonText));
  };

  const getSignerBox = (index: number, type: "signers" | "incorporators"): boolean => {
    const additionalSigner = within(screen.getByTestId(`${type}-${index}`));
    return (
      additionalSigner.getByLabelText(
        `${Config.formation.fields.signers.signColumnLabel}*`
      ) as HTMLInputElement
    ).checked;
  };

  const checkSignerBox = (index: number, type: "signers" | "incorporators"): void => {
    const additionalSigner = within(screen.getByTestId(`${type}-${index}`));
    fireEvent.click(additionalSigner.getByLabelText(`${Config.formation.fields.signers.signColumnLabel}*`));
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

  const fillAndSubmitAddressModal = async (
    overrides: Partial<FormationSignedAddress>,
    fieldName: string
  ): Promise<void> => {
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
    fireEvent.click(screen.getByText(Config.formation.general.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const selectDate = (
    value: DateObject,
    fieldType: "Business start date" | "Foreign date of formation"
  ): void => {
    fillText(fieldType, value.format(defaultDisplayDateFormat));
    fireEvent.blur(screen.getByLabelText(fieldType));
  };

  const completeRequiredBillingFields = (): void => {
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    fillText("Contact first name", "John");
    fillText("Contact last name", "Smith");
    fillText("Contact phone number", "1234567890");
  };

  const uploadFile = async (file: File): Promise<void> => {
    const uploader = screen.getByTestId("file-input");
    fireEvent.change(uploader, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByTestId("file-is-read")).toBeInTheDocument();
    });
  };

  const completeWillPracticeLaw = (response = false): void => {
    if (response) {
      fireEvent.click(screen.getByTestId("willPracticeLaw-true"));
    } else {
      fireEvent.click(screen.getByTestId("willPracticeLaw-false"));
    }
  };

  const getListBoxForInputElementByTestId = async (testId: string): Promise<HTMLInputElement> => {
    fireEvent.click(screen.getByTestId(testId));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    return screen.getByRole("listbox") as HTMLInputElement;
  };

  return {
    fillText,
    fillAndSubmitBusinessNameStep,
    fillAndBlurBusinessName,
    submitBusinessNameStep,
    submitBusinessStep,
    submitContactsStep,
    submitNexusBusinessNameStep,
    fillAndSubmitNexusBusinessNameStep,
    getListBoxForInputElementByTestId,
    submitBillingStep,
    submitReviewStep,
    searchBusinessName,
    searchBusinessNameAndGetError,
    chooseRadio,
    stepperClickToNexusBusinessNameStep,
    getInputElementByLabel,
    getInputElementByParentTestId,
    selectByText,
    selectCheckbox,
    selectCheckboxByTestId,
    clickAddNewSigner,
    clickAddNewIncorporator,
    checkSignerBox,
    getSignerBox,
    clickAddressSubmit,
    openAddressModal,
    fillAddressModal,
    fillAndSubmitAddressModal,
    clickSubmit,
    clickSubmitAndGetError,
    selectDate,
    stepperClickToBusinessNameStep,
    getInputElementByTestId,
    stepperClickToBusinessStep,
    stepperClickToContactsStep,
    stepperClickToBillingStep,
    stepperClickToReviewStep,
    getStepStateInStepper,
    completeRequiredBillingFields,
    uploadFile,
    completeWillPracticeLaw,
  };
};

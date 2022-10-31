import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import * as api from "@/lib/api-client/apiClient";
import { FormationDisplayContentMap, NameAvailability, Task } from "@/lib/types/types";
import {
  generateFormationAddress,
  generateFormationData,
  generateMunicipality,
  generateNameAvailability,
  generateProfileData,
  generateStateInput,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  DateObject,
  FormationAddress,
  FormationLegalType,
  FormationLegalTypes,
  FormationSubmitResponse,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

export function flushPromises() {
  return new Promise((resolve) => {
    return process.nextTick(resolve);
  });
}

export const generateFormationLegalType = (): FormationLegalType => {
  const randomIndex = Math.floor(Math.random() * FormationLegalTypes.length);
  return FormationLegalTypes[randomIndex] as FormationLegalType;
};

export const generateFormationProfileData = (data: Partial<ProfileData>): ProfileData => {
  return generateProfileData({
    legalStructureId: generateFormationLegalType(),
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
  displayContent: FormationDisplayContentMap,
  municipalities?: Municipality[],
  task?: Task
): FormationPageHelpers => {
  const genericTown =
    userData.profileData?.municipality ?? generateMunicipality({ displayName: "GenericTown" });
  const profileData = generateFormationProfileData({ ...userData.profileData, municipality: genericTown });
  const initialUserData = generateUserData({
    ...userData,
    profileData,
    formationData: generateFormationData(
      { ...userData.formationData },
      profileData.legalStructureId as FormationLegalType
    ),
  });
  render(
    <WithStatefulUserData initialUserData={initialUserData}>
      <ThemeProvider theme={createTheme()}>
        <BusinessFormation
          task={task ?? generateTask({})}
          displayContent={displayContent}
          municipalities={municipalities ? [genericTown, ...municipalities] : [genericTown]}
        />
      </ThemeProvider>
    </WithStatefulUserData>
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
  submitBusinessStep: (completed?: boolean) => Promise<void>;
  submitContactsStep: (completed?: boolean) => Promise<void>;
  submitBillingStep: () => Promise<void>;
  submitReviewStep: () => Promise<void>;
  stepperClickToBusinessNameStep: () => Promise<void>;
  stepperClickToBusinessStep: () => Promise<void>;
  stepperClickToContactsStep: () => Promise<void>;
  stepperClickToBillingStep: () => Promise<void>;
  stepperClickToReviewStep: () => Promise<void>;
  getStepStateInStepper: (index: number) => string;
  searchBusinessName: (nameAvailability: Partial<NameAvailability>) => Promise<void>;
  searchBusinessNameAndGetError: (errorCode?: number) => Promise<void>;
  chooseRadio: (value: string) => void;
  getInputElementByLabel: (label: string) => HTMLInputElement;
  selectByText: (label: string, value: string) => void;
  selectCheckbox: (label: string) => void;
  clickAddNewSigner: () => void;
  getSignerBox: (index: number) => boolean;
  checkSignerBox: (index: number) => void;
  clickAddressSubmit: () => void;
  openAddressModal: (fieldName: string) => Promise<void>;
  fillAddressModal: (overrides: Partial<FormationAddress>) => Promise<void>;
  fillAndSubmitAddressModal: (overrides: Partial<FormationAddress>, fieldName: string) => Promise<void>;
  clickSubmit: () => Promise<void>;
  selectDate: (value: DateObject) => void;
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

  const getStepStateInStepper = (index: number): string => {
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

  const getSignerBox = (index: number): boolean => {
    const additionalSigner = within(screen.getByTestId(`signers-${index}`));
    return (
      additionalSigner.getByLabelText(
        `${Config.businessFormationDefaults.signatureColumnLabel}*`
      ) as HTMLInputElement
    ).checked;
  };

  const checkSignerBox = (index: number): void => {
    const additionalSigner = within(screen.getByTestId(`signers-${index}`));
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

  const fillAndSubmitAddressModal = async (overrides: Partial<FormationAddress>, fieldName: string) => {
    await openAddressModal(fieldName);
    await fillAddressModal(overrides);
    clickAddressSubmit();
    await waitFor(() => {
      expect(screen.queryByTestId(`${fieldName}-address-modal`)).not.toBeInTheDocument();
    });
  };

  const fillAddressModal = async (overrides: Partial<FormationAddress>): Promise<void> => {
    const member = generateFormationAddress({ addressState: generateStateInput(), ...overrides });
    fillText("Address name", member.name);
    fillText("Address line1", member.addressLine1);
    fillText("Address line2", member.addressLine2);
    fillText("Address city", member.addressCity);
    fillText("Address state", member.addressState);
    fillText("Address zip code", member.addressZipCode);
  };

  const clickSubmit = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const selectDate = (value: DateObject) => {
    fillText("Business start date", value.format("MM/DD/YYYY"));
    fireEvent.blur(screen.getByLabelText("Business start date"));
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
    submitBillingStep,
    submitReviewStep,
    searchBusinessName,
    searchBusinessNameAndGetError,
    chooseRadio,
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
    stepperClickToBusinessStep,
    stepperClickToContactsStep,
    stepperClickToBillingStep,
    stepperClickToReviewStep,
    getStepStateInStepper,
    completeRequiredBillingFields,
  };
};

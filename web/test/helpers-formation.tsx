import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import * as api from "@/lib/api-client/apiClient";
import { FormationDisplayContentMap, NameAvailability } from "@/lib/types/types";
import {
  generateFormationData,
  generateFormationMember,
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
  FormationLegalType,
  FormationLegalTypes,
  FormationMember,
  FormationSubmitResponse,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";

function flushPromises() {
  return new Promise((resolve) => process.nextTick(resolve));
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
  municipalities?: Municipality[]
): FormationPageHelpers => {
  const genericTown = userData.profileData?.municipality
    ? userData.profileData.municipality
    : generateMunicipality({ displayName: "GenericTown" });
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
          task={generateTask({})}
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
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

export type FormationPageHelpers = {
  fillText: (label: string, value: string) => void;
  submitBusinessNameTab: (businessName?: string) => Promise<void>;
  submitBusinessTab: (completed?: boolean) => Promise<void>;
  submitContactsTab: (completed?: boolean) => Promise<void>;
  submitReviewTab: () => Promise<void>;
  searchBusinessName: (nameAvailability: Partial<NameAvailability>) => Promise<void>;
  searchBusinessNameAndGetError: (errorCode?: number) => Promise<void>;
  chooseRadio: (value: string) => void;
  getInputElementByLabel: (label: string) => HTMLInputElement;
  selectByText: (label: string, value: string) => void;
  selectCheckbox: (label: string) => void;
  clickAddNewSigner: () => void;
  checkSignerBox: (index: number) => void;
  clickMemberSubmit: () => void;
  openMemberModal: () => Promise<void>;
  fillMemberModal: (overrides: Partial<FormationMember>) => Promise<void>;
  fillAndSubmitMemberModal: (overrides: Partial<FormationMember>) => Promise<void>;
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

  const submitBusinessNameTab = async (businessName = "Default Test Name"): Promise<void> => {
    fillText("Search business name", businessName);
    await searchBusinessName({ status: "AVAILABLE" });

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.initialNextButtonText));

    await waitFor(() => {
      expect(screen.queryByTestId("business-section")).toBeInTheDocument();
    });
  };

  const submitBusinessTab = async (completed = true): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.nextButtonText));

    if (completed) {
      await waitFor(() => {
        expect(screen.queryByTestId("contacts-section")).toBeInTheDocument();
      });
    } else {
      await waitFor(() => {
        expect(screen.queryByTestId("contacts-section")).not.toBeInTheDocument();
      });
    }
  };

  const submitContactsTab = async (completed = true): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.nextButtonText));

    if (completed)
      await waitFor(() => {
        expect(screen.queryByTestId("review-section")).toBeInTheDocument();
      });
  };

  const submitReviewTab = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.nextButtonText));

    await waitFor(() => {
      expect(screen.queryByTestId("payment-section")).toBeInTheDocument();
    });
  };

  const searchBusinessName = async (nameAvailability: Partial<NameAvailability>): Promise<void> => {
    const returnedPromise = Promise.resolve(generateNameAvailability(nameAvailability));
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(screen.getByText(Config.searchBusinessNameTask.searchButtonText));
    await act(() => returnedPromise.then());
  };

  const searchBusinessNameAndGetError = async (errorCode = 500): Promise<void> => {
    const returnedPromise = Promise.reject(errorCode);
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(screen.getByText(Config.searchBusinessNameTask.searchButtonText));
    await act(() => returnedPromise.catch(() => {}));
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

  const checkSignerBox = (index: number): void => {
    const additionalSigner = within(screen.getByTestId(`additional-signers-${index}`));
    fireEvent.click(
      additionalSigner.getByLabelText(`${Config.businessFormationDefaults.signatureColumnLabel}*`)
    );
  };

  const clickMemberSubmit = (): void => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.membersModalNextButtonText));
  };

  const openMemberModal = async (): Promise<void> => {
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.membersNewButtonText));
    await waitFor(() => {
      expect(
        screen.getByText(Config.businessFormationDefaults.membersModalNextButtonText)
      ).toBeInTheDocument();
    });
  };

  const fillAndSubmitMemberModal = async (overrides: Partial<FormationMember>) => {
    await openMemberModal();
    await fillMemberModal(overrides);
    clickMemberSubmit();
    await waitFor(() => {
      expect(
        screen.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
      ).toBeInTheDocument();
    });
  };

  const fillMemberModal = async (overrides: Partial<FormationMember>): Promise<void> => {
    const member = generateFormationMember({ addressState: generateStateInput(), ...overrides });
    fillText("Member name", member.name);
    fillText("Member address line1", member.addressLine1);
    fillText("Member address line2", member.addressLine2);
    fillText("Member address city", member.addressCity);
    fillText("Member address state", member.addressState);
    fillText("Member address zip code", member.addressZipCode);
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

  return {
    fillText,
    submitBusinessNameTab,
    submitBusinessTab,
    submitContactsTab,
    submitReviewTab,
    searchBusinessName,
    searchBusinessNameAndGetError,
    chooseRadio,
    getInputElementByLabel,
    selectByText,
    selectCheckbox,
    clickAddNewSigner,
    checkSignerBox,
    clickMemberSubmit,
    openMemberModal,
    fillMemberModal,
    fillAndSubmitMemberModal,
    clickSubmit,
    selectDate,
  };
};

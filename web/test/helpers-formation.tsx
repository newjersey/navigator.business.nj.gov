import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import * as api from "@/lib/api-client/apiClient";
import { FormationDisplayContent, NameAvailability } from "@/lib/types/types";
import {
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
  FormationMember,
  FormationSubmitResponse,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { act, fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import React from "react";

function flushPromises() {
  return new Promise((resolve) => process.nextTick(resolve));
}

export const generateLLCProfileData = (data: Partial<ProfileData>): ProfileData => {
  return generateProfileData({
    legalStructureId: "limited-liability-company",
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

export type RenderedTask = {
  subject: RenderResult;
  page: FormationPageHelpers;
};

export const renderTask = (
  userData: Partial<UserData>,
  displayContent: FormationDisplayContent,
  municipalities?: Municipality[]
): RenderedTask => {
  const genericTown = userData.profileData?.municipality
    ? userData.profileData.municipality
    : generateMunicipality({ displayName: "GenericTown" });
  const initialUserData = generateUserData({
    ...userData,
    profileData: generateProfileData({ ...userData.profileData, municipality: genericTown }),
  });
  const subject = render(
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
  return {
    subject,
    page: createFormationPageHelpers(subject),
  };
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

export const createFormationPageHelpers = (subject: RenderResult): FormationPageHelpers => {
  const mockApi = api as jest.Mocked<typeof api>;
  const fillText = (label: string, value: string) => {
    const item = subject.getByLabelText(label);
    fireEvent.change(item, { target: { value: value } });
    fireEvent.blur(item);
  };

  const submitBusinessNameTab = async (businessName = "Default Test Name"): Promise<void> => {
    fillText("Search business name", businessName);
    await searchBusinessName({ status: "AVAILABLE" });

    fireEvent.click(subject.getByText(Config.businessFormationDefaults.initialNextButtonText));

    await waitFor(() => {
      expect(subject.queryByTestId("business-section")).toBeInTheDocument();
    });
  };

  const submitBusinessTab = async (completed = true): Promise<void> => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.nextButtonText));

    if (completed) {
      await waitFor(() => {
        expect(subject.queryByTestId("contacts-section")).toBeInTheDocument();
      });
    } else {
      await waitFor(() => {
        expect(subject.queryByTestId("contacts-section")).not.toBeInTheDocument();
      });
    }
  };

  const submitContactsTab = async (completed = true): Promise<void> => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.nextButtonText));

    if (completed)
      await waitFor(() => {
        expect(subject.queryByTestId("review-section")).toBeInTheDocument();
      });
  };

  const submitReviewTab = async (): Promise<void> => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.nextButtonText));

    await waitFor(() => {
      expect(subject.queryByTestId("payment-section")).toBeInTheDocument();
    });
  };

  const searchBusinessName = async (nameAvailability: Partial<NameAvailability>): Promise<void> => {
    const returnedPromise = Promise.resolve(generateNameAvailability(nameAvailability));
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(subject.getByText(Config.searchBusinessNameTask.searchButtonText));
    await act(() => returnedPromise.then());
  };

  const searchBusinessNameAndGetError = async (errorCode = 500): Promise<void> => {
    const returnedPromise = Promise.reject(errorCode);
    mockApi.searchBusinessName.mockReturnValue(returnedPromise);
    fireEvent.click(subject.getByText(Config.searchBusinessNameTask.searchButtonText));
    await act(() => returnedPromise.catch(() => {}));
  };

  const chooseRadio = (value: string): void => {
    fireEvent.click(subject.getByTestId(value));
  };

  const getInputElementByLabel = (label: string): HTMLInputElement => {
    return subject.getByLabelText(label) as HTMLInputElement;
  };

  const selectByText = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const selectCheckbox = (label: string): void => {
    fireEvent.click(subject.getByLabelText(label));
  };

  const clickAddNewSigner = (): void => {
    fireEvent.click(
      subject.getByText(Config.businessFormationDefaults.addNewSignerButtonText, { exact: false })
    );
  };

  const checkSignerBox = (index: number): void => {
    const additionalSigner = within(subject.getByTestId(`additional-signers-${index}`));
    fireEvent.click(
      additionalSigner.getByLabelText(`${Config.businessFormationDefaults.signatureColumnLabel}*`)
    );
  };

  const clickMemberSubmit = (): void => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.membersModalNextButtonText));
  };

  const openMemberModal = async (): Promise<void> => {
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.membersNewButtonText));
    await waitFor(() => {
      expect(
        subject.getByText(Config.businessFormationDefaults.membersModalNextButtonText)
      ).toBeInTheDocument();
    });
  };

  const fillAndSubmitMemberModal = async (overrides: Partial<FormationMember>) => {
    await openMemberModal();
    await fillMemberModal(overrides);
    clickMemberSubmit();
    await waitFor(() => {
      expect(
        subject.getByText(Config.businessFormationDefaults.membersSuccessTextBody, { exact: false })
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
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.submitButtonText));
    await act(async () => {
      await flushPromises();
    });
  };

  const selectDate = (value: DateObject) => {
    fillText("Business start date", value.format("MM/DD/YYYY"));
    fireEvent.blur(subject.getByLabelText("Business start date"));
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

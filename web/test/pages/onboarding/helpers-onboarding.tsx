import { Municipality } from "@businessnjgovnavigator/shared";
import {
  createEmptyProfileDisplayContent,
  createEmptyUserData,
  ProfileDisplayContent,
  UserData,
} from "@/lib/types/types";
import { fireEvent, render, RenderResult, waitForElementToBeRemoved, within } from "@testing-library/react";
import { generateUser } from "@/test/factories";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Onboarding from "@/pages/onboarding";
import React from "react";

export const renderPage = ({
  municipalities,
  displayContent,
  userData,
}: {
  municipalities?: Municipality[];
  displayContent?: ProfileDisplayContent;
  userData?: UserData;
}): { subject: RenderResult; page: PageHelpers } => {
  const emptyUserData = createEmptyUserData(generateUser({}));
  const subject = render(
    <WithStatefulUserData initialUserData={userData || emptyUserData}>
      <Onboarding
        displayContent={displayContent || createEmptyProfileDisplayContent()}
        municipalities={municipalities || []}
      />
    </WithStatefulUserData>
  );
  const page = createPageHelpers(subject);
  return { subject, page };
};

export type PageHelpers = {
  fillText: (label: string, value: string) => void;
  selectByValue: (label: string, value: string) => void;
  selectByText: (label: string, value: string) => void;
  chooseRadio: (value: string) => void;
  clickNext: () => void;
  clickBack: () => void;
  getEntityIdValue: () => string;
  getBusinessNameValue: () => string;
  getIndustryValue: () => string;
  getRadioButtonValue: () => string;
  getMunicipalityValue: () => string;
  visitStep2: () => Promise<void>;
  visitStep3: () => Promise<void>;
  visitStep4: () => Promise<void>;
  visitStep5: () => Promise<void>;
};

export const createPageHelpers = (subject: RenderResult): PageHelpers => {
  const fillText = (label: string, value: string) => {
    fireEvent.change(subject.getByLabelText(label), { target: { value: value } });
  };

  const selectByValue = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectByText = (label: string, value: string) => {
    fireEvent.mouseDown(subject.getByLabelText(label));
    const listbox = within(subject.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const chooseRadio = (value: string) => {
    fireEvent.click(subject.getByTestId(value));
  };

  const clickNext = (): void => {
    fireEvent.click(subject.getAllByTestId("next")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(subject.getAllByTestId("back")[0]);
  };

  const getEntityIdValue = (): string => (subject.queryByLabelText("Entity id") as HTMLInputElement)?.value;

  const getBusinessNameValue = (): string =>
    (subject.queryByLabelText("Business name") as HTMLInputElement)?.value;

  const getIndustryValue = (): string => (subject.queryByTestId("industryid") as HTMLInputElement)?.value;

  const getRadioButtonValue = (): string => {
    const checked = subject.container.querySelector(".Mui-checked input") as HTMLInputElement;
    return checked.value as string;
  };

  const getMunicipalityValue = (): string =>
    (subject.queryByTestId("municipality") as HTMLInputElement)?.value;

  const visitStep2 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByTestId("step-1"));
  };

  const visitStep3 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByTestId("step-2"));
  };

  const visitStep4 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByTestId("step-3"));
  };

  const visitStep5 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByTestId("step-4"));
  };

  return {
    fillText,
    selectByValue,
    selectByText,
    chooseRadio,
    clickNext,
    clickBack,
    getEntityIdValue,
    getBusinessNameValue,
    getIndustryValue,
    getRadioButtonValue,
    getMunicipalityValue,
    visitStep2,
    visitStep3,
    visitStep4,
    visitStep5,
  };
};

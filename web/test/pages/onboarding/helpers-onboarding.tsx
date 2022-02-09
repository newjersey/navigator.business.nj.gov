import { createEmptyLoadDisplayContent, LoadDisplayContent } from "@/lib/types/types";
import Onboarding from "@/pages/onboarding";
import { generateUser } from "@/test/factories";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { createEmptyUserData, Municipality, UserData } from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, RenderResult, waitForElementToBeRemoved, within } from "@testing-library/react";
import { Dayjs } from "dayjs";
import React from "react";

export const renderPage = ({
  municipalities,
  displayContent,
  userData,
}: {
  municipalities?: Municipality[];
  displayContent?: LoadDisplayContent;
  userData?: UserData;
}): { subject: RenderResult; page: PageHelpers } => {
  const emptyUserData = createEmptyUserData(generateUser({}));
  const subject = render(
    <WithStatefulUserData initialUserData={userData || emptyUserData}>
      <ThemeProvider theme={createTheme()}>
        <Onboarding
          displayContent={displayContent || createEmptyLoadDisplayContent()}
          municipalities={municipalities || []}
        />
      </ThemeProvider>
    </WithStatefulUserData>
  );
  const page = createPageHelpers(subject);
  return { subject, page };
};

export type PageHelpers = {
  fillText: (label: string, value: string) => void;
  selectDate: (label: string, value: Dayjs) => void;
  selectByValue: (label: string, value: string) => void;
  selectByText: (label: string, value: string) => void;
  chooseRadio: (value: string) => void;
  clickNext: () => void;
  clickBack: () => void;
  getDateOfFormationValue: () => string;
  getEntityIdValue: () => string;
  getBusinessNameValue: () => string;
  getSectorIDValue: () => string;
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

  const selectDate = (label: string, value: Dayjs) => {
    fillText(label, value.format("MM/DD/YYYY"));
    fireEvent.blur(subject.getByLabelText("Date of formation"));
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

  const getDateOfFormationValue = (): string =>
    (subject.queryByLabelText("Date of formation") as HTMLInputElement)?.value;

  const getBusinessNameValue = (): string =>
    (subject.queryByLabelText("Business name") as HTMLInputElement)?.value;

  const getSectorIDValue = (): string => (subject.queryByLabelText("Sector") as HTMLInputElement)?.value;

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
    selectDate,
    chooseRadio,
    clickNext,
    clickBack,
    getEntityIdValue,
    getDateOfFormationValue,
    getBusinessNameValue,
    getIndustryValue,
    getRadioButtonValue,
    getMunicipalityValue,
    getSectorIDValue,
    visitStep2,
    visitStep3,
    visitStep4,
    visitStep5,
  };
};

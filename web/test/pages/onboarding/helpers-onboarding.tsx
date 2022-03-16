import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { createEmptyLoadDisplayContent, LoadDisplayContent } from "@/lib/types/types";
import Onboarding from "@/pages/onboarding";
import { generateProfileData, generateUser, generateUserData } from "@/test/factories";
import { withAuth } from "@/test/helpers";
import { mockPush } from "@/test/mock/mockRouter";
import { currentUserData, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  createEmptyUser,
  createEmptyUserData,
  Municipality,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { Dayjs } from "dayjs";
import React from "react";

const mockApi = api as jest.Mocked<typeof api>;

export const renderPage = ({
  municipalities,
  displayContent,
  userData,
  user,
  isAuthenticated,
}: {
  municipalities?: Municipality[];
  displayContent?: LoadDisplayContent;
  userData?: UserData | null;
  user?: BusinessUser;
  isAuthenticated?: IsAuthenticated;
}): { subject: RenderResult; page: PageHelpers } => {
  const subject = render(
    withAuth(
      <WithStatefulUserData
        initialUserData={
          userData === undefined
            ? createEmptyUserData(generateUser({}))
            : userData === null
            ? undefined
            : userData
        }
      >
        <ThemeProvider theme={createTheme()}>
          <Onboarding
            displayContent={displayContent || createEmptyLoadDisplayContent()}
            municipalities={municipalities || []}
          />
        </ThemeProvider>
      </WithStatefulUserData>,
      { user, isAuthenticated }
    )
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
  getFullNameValue: () => string;
  getEmailValue: () => string;
  getConfirmEmailValue: () => string;
  visitStep2: () => Promise<void>;
  visitStep3: () => Promise<void>;
  visitStep4: () => Promise<void>;
  visitStep5: () => Promise<void>;
  visitStep6: () => Promise<void>;
};

export const createPageHelpers = (subject: RenderResult): PageHelpers => {
  const fillText = (label: string, value: string) => {
    const item = subject.getByLabelText(label);
    fireEvent.change(item, { target: { value: value } });
    fireEvent.blur(item);
  };

  const selectDate = (label: string, value: Dayjs) => {
    fillText(label, value.format("MM/YYYY"));
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

  const getFullNameValue = (): string =>
    (subject.queryByLabelText(Config.selfRegistration.nameFieldLabel) as HTMLInputElement)?.value;

  const getEmailValue = (): string =>
    (subject.queryByLabelText(Config.selfRegistration.emailFieldLabel) as HTMLInputElement)?.value;

  const getConfirmEmailValue = (): string =>
    (subject.queryByLabelText(Config.selfRegistration.confirmEmailFieldLabel) as HTMLInputElement)?.value;

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

  const visitStep6 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => subject.getByTestId("step-5"));
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
    getFullNameValue,
    getEmailValue,
    getConfirmEmailValue,
    visitStep2,
    visitStep3,
    visitStep4,
    visitStep5,
    visitStep6,
  };
};

export const runSelfRegPageTests = (
  { hasExistingBusiness }: { hasExistingBusiness: boolean },
  advanceToSelfReg: (page: PageHelpers) => Promise<void>
) => {
  let page: PageHelpers;
  let subject: RenderResult;
  const user = createEmptyUser();
  const userData = generateUserData({ user, profileData: generateProfileData({ hasExistingBusiness }) });

  beforeEach(async () => {
    const render = renderPage({ userData });
    page = render.page;
    subject = render.subject;
    await advanceToSelfReg(page);
    mockApi.postNewsletter.mockImplementation((request) =>
      Promise.resolve({
        ...request,
        user: {
          ...request.user,
          externalStatus: {
            ...request.user.externalStatus,
            newsletter: { status: "SUCCESS", success: true },
          },
        },
      })
    );

    mockApi.postUserTesting.mockImplementation((request) =>
      Promise.resolve({
        ...request,
        user: {
          ...request.user,
          externalStatus: {
            ...request.user.externalStatus,
            userTesting: { status: "SUCCESS", success: true },
          },
        },
      })
    );
  });

  it("prevents user from registering if the email is not matching", async () => {
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.co");
    page.clickNext();
    expect(subject.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
    expect(currentUserData().user).toEqual(user);
  });

  it("prevents user from registering if the email is not matching after changing it", async () => {
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.co");
    page.clickNext();
    expect(subject.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
    expect(currentUserData().user).toEqual(user);
  });

  it("prevents user from registering if the name is empty", async () => {
    page.fillText(Config.selfRegistration.nameFieldLabel, "");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    page.clickNext();
    expect(subject.queryByText(Config.selfRegistration.errorTextRequiredFields)).toBeInTheDocument();
    expect(currentUserData().user).toEqual(user);
  });

  it("prevents user from registering if the email is empty", async () => {
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "");
    page.clickNext();
    expect(subject.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
    expect(currentUserData().user).toEqual(user);
  });

  it("allows a user to uncheck to opt out of newsletter", async () => {
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    fireEvent.click(subject.getByLabelText(Config.selfRegistration.newsletterCheckboxLabel));
    page.clickNext();
    const businessUser = {
      ...user,
      email: "email@example.com",
      name: "My Name",
      receiveNewsletter: false,
      userTesting: true,
      externalStatus: { userTesting: { status: "SUCCESS", success: true } },
    };

    await waitFor(() => {
      expect(currentUserData().user).toEqual(businessUser);
    });
  });

  it("allows a user to uncheck to opt out of user testing", async () => {
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    fireEvent.click(subject.getByLabelText(Config.selfRegistration.userTestingCheckboxLabel));
    page.clickNext();
    const businessUser = {
      ...user,
      email: "email@example.com",
      name: "My Name",
      receiveNewsletter: true,
      userTesting: false,
      externalStatus: { newsletter: { status: "SUCCESS", success: true } },
    };

    await waitFor(() => {
      expect(currentUserData().user).toEqual(businessUser);
    });
  });

  it("redirects the user after completion", async () => {
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    page.clickNext();
    const businessUser = {
      ...user,
      email: "email@example.com",
      name: "My Name",
      receiveNewsletter: true,
      userTesting: true,
      externalStatus: {
        newsletter: { status: "SUCCESS", success: true },
        userTesting: { status: "SUCCESS", success: true },
      },
    };
    await waitFor(() => {
      expect(currentUserData().user).toEqual(businessUser);
      expect(mockPush).toHaveBeenCalledWith(hasExistingBusiness ? "/dashboard" : "/roadmap");
    });
  });
};

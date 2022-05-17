import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { createEmptyLoadDisplayContent, LoadDisplayContent } from "@/lib/types/types";
import Onboarding from "@/pages/onboarding";
import { generateProfileData, generateUser, generateUserData, randomLegalStructure } from "@/test/factories";
import { withAuth } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  createEmptyUser,
  createEmptyUserData,
  DateObject,
  Municipality,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { createTheme, ThemeProvider } from "@mui/material";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
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
}): { page: PageHelpers } => {
  const currentUser = user ?? userData?.user ?? generateUser({});
  render(
    withAuth(
      <WithStatefulUserData
        initialUserData={
          userData === undefined ? createEmptyUserData(currentUser) : userData === null ? undefined : userData
        }
      >
        <ThemeProvider theme={createTheme()}>
          <Onboarding
            displayContent={displayContent || createEmptyLoadDisplayContent()}
            municipalities={municipalities || []}
          />
        </ThemeProvider>
      </WithStatefulUserData>,
      { user: currentUser, isAuthenticated }
    )
  );
  const page = createPageHelpers();
  return { page };
};

export type PageHelpers = {
  fillText: (label: string, value: string) => void;
  selectDate: (label: string, value: DateObject) => void;
  selectByValue: (label: string, value: string) => void;
  selectByText: (label: string, value: string) => void;
  chooseRadio: (value: string) => void;
  clickNext: () => void;
  clickBack: () => void;
  getDateOfFormationValue: () => string;
  getEntityIdValue: () => string;
  getBusinessNameValue: () => string;
  getLegalStructureValue: () => string;
  getSectorIDValue: () => string;
  getIndustryValue: () => string;
  getRadioGroup: (sectionAriaLabel: string) => HTMLElement;
  getRadioButton: (sectionAriaLabel: string) => HTMLElement;
  getMunicipalityValue: () => string;
  getFullNameValue: () => string;
  getEmailValue: () => string;
  getConfirmEmailValue: () => string;
  visitStep2: () => Promise<void>;
  visitStep3: () => Promise<void>;
  visitStep4: () => Promise<void>;
  visitStep5: () => Promise<void>;
};

export const createPageHelpers = (): PageHelpers => {
  const fillText = (label: string, value: string) => {
    const item = screen.getByLabelText(label);
    fireEvent.change(item, { target: { value: value } });
    fireEvent.blur(item);
  };

  const selectDate = (label: string, value: DateObject) => {
    fillText(label, value.format("MM/YYYY"));
    fireEvent.blur(screen.getByLabelText("Date of formation"));
  };

  const selectByValue = (label: string, value: string) => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectByText = (label: string, value: string) => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const chooseRadio = (value: string) => {
    fireEvent.click(screen.getByTestId(value));
  };

  const clickNext = (): void => {
    fireEvent.click(screen.getAllByTestId("next")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(screen.getAllByTestId("back")[0]);
  };

  const getEntityIdValue = (): string => (screen.queryByLabelText("Entity id") as HTMLInputElement)?.value;

  const getDateOfFormationValue = (): string =>
    (screen.queryByLabelText("Date of formation") as HTMLInputElement)?.value;

  const getBusinessNameValue = (): string =>
    (screen.queryByLabelText("Business name") as HTMLInputElement)?.value;

  const getSectorIDValue = (): string => (screen.queryByLabelText("Sector") as HTMLInputElement)?.value;

  const getIndustryValue = (): string => (screen.queryByTestId("industryid") as HTMLInputElement)?.value;

  const getRadioGroup = (sectionAriaLabel: string): HTMLElement => {
    const radiogroup = screen.getByRole("radiogroup", { name: sectionAriaLabel });
    return radiogroup;
  };

  const getRadioButton = (sectionAriaLabel: string): HTMLElement => {
    const radio = screen.getByRole("radio", { name: sectionAriaLabel });
    return radio;
  };

  const getMunicipalityValue = (): string =>
    (screen.queryByTestId("municipality") as HTMLInputElement)?.value;

  const getLegalStructureValue = (): string =>
    (screen.queryByTestId("legal-structure") as HTMLInputElement)?.value;

  const getFullNameValue = (): string =>
    (screen.queryByLabelText(Config.selfRegistration.nameFieldLabel) as HTMLInputElement)?.value;

  const getEmailValue = (): string =>
    (screen.queryByLabelText(Config.selfRegistration.emailFieldLabel) as HTMLInputElement)?.value;

  const getConfirmEmailValue = (): string =>
    (screen.queryByLabelText(Config.selfRegistration.confirmEmailFieldLabel) as HTMLInputElement)?.value;

  const visitStep2 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => screen.getByTestId("step-1"));
  };

  const visitStep3 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => screen.getByTestId("step-2"));
  };

  const visitStep4 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => screen.getByTestId("step-3"));
  };

  const visitStep5 = async () => {
    clickNext();
    await waitForElementToBeRemoved(() => screen.getByTestId("step-4"));
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
    getLegalStructureValue,
    getIndustryValue,
    getRadioGroup,
    getRadioButton,
    getMunicipalityValue,
    getSectorIDValue,
    getFullNameValue,
    getEmailValue,
    getConfirmEmailValue,
    visitStep2,
    visitStep3,
    visitStep4,
    visitStep5,
  };
};

export const runSelfRegPageTests = ({
  hasExistingBusiness,
  requiresPublicFiling,
  selfRegPage,
}: {
  hasExistingBusiness: boolean;
  requiresPublicFiling?: boolean;
  selfRegPage: string;
}) => {
  const user = createEmptyUser();
  const userData = generateUserData({
    user,
    formProgress: "UNSTARTED",
    profileData: generateProfileData({
      hasExistingBusiness,
      legalStructureId: randomLegalStructure(requiresPublicFiling)?.id,
    }),
  });

  beforeEach(() => {
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

  it("prevents user from registering if the email is not matching", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.co");
    act(() => page.clickNext());
    expect(screen.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("prevents user from registering if the email is not matching after changing it", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.co");
    act(() => page.clickNext());
    expect(screen.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("prevents user from registering if the name is empty", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => page.clickNext());
    expect(screen.queryByText(Config.selfRegistration.errorTextFullName)).toBeInTheDocument();
  });

  it("prevents user from registering if the email is empty", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "");
    act(() => page.clickNext());
    expect(screen.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("allows a user to uncheck to opt out of newsletter", async () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    fireEvent.click(screen.getByLabelText(Config.selfRegistration.newsletterCheckboxLabel));
    act(() => page.clickNext());
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
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    fireEvent.click(screen.getByLabelText(Config.selfRegistration.userTestingCheckboxLabel));
    act(() => page.clickNext());
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
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    /*await waitFor(() => {
      expect(screen.findByLabelText(Config.selfRegistration.nameFieldLabel)).toBeInTheDocument()
    })*/
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => page.clickNext());
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

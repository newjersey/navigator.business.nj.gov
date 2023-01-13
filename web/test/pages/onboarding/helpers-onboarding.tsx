import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  EssentialQuestionObject,
  getEssentialQuestion,
  hasEssentialQuestion,
} from "@/lib/domain-logic/essentialQuestions";
import { ROUTES } from "@/lib/domain-logic/routes";
import { camelCaseToKebabCase } from "@/lib/utils/cases-helpers";
import Onboarding from "@/pages/onboarding";
import { generateProfileData, generateUser, generateUserData, randomLegalStructure } from "@/test/factories";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  BusinessPersona,
  BusinessUser,
  createEmptyUser,
  createEmptyUserData,
  DateObject,
  Industries,
  Municipality,
  UserData,
} from "@businessnjgovnavigator/shared/";
import {
  IndustrySpecificData,
  industrySpecificDataChoices,
} from "@businessnjgovnavigator/shared/profileData";
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

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();

export const renderPage = ({
  municipalities,
  userData,
  user,
  isAuthenticated,
}: {
  municipalities?: Municipality[];
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
          <Onboarding municipalities={municipalities || []} />
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
  checkByLabelText: (label: string) => void;
  chooseRadio: (value: string) => void;
  clickNext: () => void;
  clickBack: () => void;
  getDateOfFormationValue: () => string;
  getLegalStructureValue: () => string;
  getSectorIDValue: () => string;
  getIndustryValue: () => string;
  getRadioGroup: (sectionAriaLabel: string) => HTMLElement;
  getRadioButton: (sectionAriaLabel: string) => HTMLElement;
  getMunicipalityValue: () => string;
  getFullNameValue: () => string;
  getEmailValue: () => string;
  getConfirmEmailValue: () => string;
  visitStep: (step: number) => Promise<void>;
  chooseEssentialQuestionRadio: (industryId: string, indexOfDataChoice: number) => void;
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

  const getDateOfFormationValue = (): string => {
    return (screen.queryByLabelText("Date of formation") as HTMLInputElement)?.value;
  };

  const getSectorIDValue = (): string => {
    return (screen.queryByLabelText("Sector") as HTMLInputElement)?.value;
  };

  const getIndustryValue = (): string => {
    return (screen.queryByTestId("industryid") as HTMLInputElement)?.value;
  };

  const getRadioGroup = (sectionAriaLabel: string): HTMLElement => {
    const radiogroup = screen.getByRole("radiogroup", { name: sectionAriaLabel });
    return radiogroup;
  };

  const getRadioButton = (sectionAriaLabel: string): HTMLElement => {
    const radio = screen.getByRole("radio", { name: sectionAriaLabel });
    return radio;
  };

  const getMunicipalityValue = (): string => {
    return (screen.queryByTestId("municipality") as HTMLInputElement)?.value;
  };

  const getLegalStructureValue = (): string => {
    return (screen.queryByTestId("legal-structure") as HTMLInputElement)?.value;
  };

  const getFullNameValue = (): string => {
    return (screen.queryByLabelText(Config.selfRegistration.nameFieldLabel) as HTMLInputElement)?.value;
  };

  const getEmailValue = (): string => {
    return (screen.queryByLabelText(Config.selfRegistration.emailFieldLabel) as HTMLInputElement)?.value;
  };

  const getConfirmEmailValue = (): string => {
    return (screen.queryByLabelText(Config.selfRegistration.confirmEmailFieldLabel) as HTMLInputElement)
      ?.value;
  };

  const visitStep = async (step: number) => {
    act(() => {
      return clickNext();
    });
    const currentStep = step - 1;
    await waitForElementToBeRemoved(() => {
      return screen.getByTestId(`step-${currentStep}`);
    });
    expect(screen.getByTestId(`step-${step}`)).toBeInTheDocument();
  };

  const checkByLabelText = (label: string) => {
    fireEvent.click(screen.getByLabelText(label));
  };

  const chooseEssentialQuestionRadio = (industryId: string, indexOfIndustrySpecificDataChoices: number) => {
    const fieldName = (getEssentialQuestion(industryId) as EssentialQuestionObject)
      .fieldName as keyof IndustrySpecificData;

    const value = industrySpecificDataChoices[fieldName][indexOfIndustrySpecificDataChoices];

    fireEvent.click(
      screen.getByTestId(`${camelCaseToKebabCase(fieldName)}-radio-${value.toString().toLowerCase()}`)
    );
  };

  return {
    fillText,
    selectByValue,
    selectByText,
    selectDate,
    chooseRadio,
    clickNext,
    clickBack,
    getDateOfFormationValue,
    getLegalStructureValue,
    getIndustryValue,
    getRadioGroup,
    getRadioButton,
    getMunicipalityValue,
    getSectorIDValue,
    getFullNameValue,
    getEmailValue,
    getConfirmEmailValue,
    visitStep,
    checkByLabelText,
    chooseEssentialQuestionRadio,
  };
};

export const runSelfRegPageTests = ({
  businessPersona,
  selfRegPage,
}: {
  businessPersona: BusinessPersona;
  selfRegPage: string;
}) => {
  const user = createEmptyUser();
  const userData = generateUserData({
    user,
    formProgress: "UNSTARTED",
    profileData: generateProfileData({
      businessPersona,
      legalStructureId: randomLegalStructure().id,
    }),
  });

  beforeEach(() => {
    mockSuccessfulApiSignups();
  });

  it("prevents user from registering if the email is not matching", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.co");
    act(() => {
      return page.clickNext();
    });
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
    act(() => {
      return page.clickNext();
    });
    expect(screen.queryAllByText(Config.selfRegistration.errorTextEmailsNotMatching).length).toEqual(2);
  });

  it("prevents user from registering if the name is empty", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return page.clickNext();
    });
    expect(screen.queryByText(Config.selfRegistration.errorTextFullName)).toBeInTheDocument();
  });

  it("prevents user from registering if the name contains a special character", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "Some & Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return page.clickNext();
    });
    expect(screen.queryByText(Config.selfRegistration.errorTextFullNameSpecialCharacter)).toBeInTheDocument();
  });

  it("prevents user from registering if the name is greater than 50 characters", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    const name = Array(51).fill("a").join("");
    page.fillText(Config.selfRegistration.nameFieldLabel, name);
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return page.clickNext();
    });
    expect(screen.queryByText(Config.selfRegistration.errorTextFullNameLength)).toBeInTheDocument();
  });

  it("prevents user from registering if the name does not start with a letter", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "12345");
    page.fillText(Config.selfRegistration.emailFieldLabel, "email@example.com");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "email@example.com");
    act(() => {
      return page.clickNext();
    });
    expect(screen.queryByText(Config.selfRegistration.errorTextFullNameStartWithLetter)).toBeInTheDocument();
  });

  it("prevents user from registering if the email is empty", () => {
    useMockRouter({ isReady: true, query: { page: selfRegPage } });
    const render = renderPage({ userData, isAuthenticated: IsAuthenticated.FALSE });
    const page = render.page;
    page.fillText(Config.selfRegistration.nameFieldLabel, "My Name");
    page.fillText(Config.selfRegistration.emailFieldLabel, "");
    page.fillText(Config.selfRegistration.confirmEmailFieldLabel, "");
    act(() => {
      return page.clickNext();
    });
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
    act(() => {
      return page.clickNext();
    });
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
    act(() => {
      return page.clickNext();
    });
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
    act(() => {
      return page.clickNext();
    });
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
      expect(mockPush).toHaveBeenCalledWith({
        pathname: businessPersona === "OWNING" ? ROUTES.dashboard : ROUTES.dashboard,
        query: { fromOnboarding: "true" },
      });
    });
  });
};

export const mockEmptyApiSignups = (): void => {
  mockApi.postGetAnnualFilings.mockImplementation((request) => {
    return Promise.resolve(request);
  });
  mockApi.postNewsletter.mockImplementation((request) => {
    return Promise.resolve(request);
  });
  mockApi.postUserTesting.mockImplementation((request) => {
    return Promise.resolve(request);
  });
};

export const mockSuccessfulApiSignups = (): void => {
  mockApi.postGetAnnualFilings.mockImplementation((request) => {
    return Promise.resolve(request);
  });
  mockApi.postNewsletter.mockImplementation((request) => {
    return Promise.resolve({
      ...request,
      user: {
        ...request.user,
        externalStatus: {
          ...request.user.externalStatus,
          newsletter: { status: "SUCCESS", success: true },
        },
      },
    });
  });

  mockApi.postUserTesting.mockImplementation((request) => {
    return Promise.resolve({
      ...request,
      user: {
        ...request.user,
        externalStatus: {
          ...request.user.externalStatus,
          userTesting: { status: "SUCCESS", success: true },
        },
      },
    });
  });
};

export const industriesWithEssentialQuestion = Industries.filter((industry) => {
  return hasEssentialQuestion(industry.id) === true && industry.isEnabled;
});

export const industriesWithOutEssentialQuestion = Industries.filter((industry) => {
  return hasEssentialQuestion(industry.id) === false && industry.isEnabled;
});

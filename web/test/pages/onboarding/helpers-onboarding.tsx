import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  EssentialQuestions,
  getEssentialQuestion,
  hasEssentialQuestion,
  hasMultipleEssentialQuestions,
} from "@/lib/domain-logic/essentialQuestions";
import { modifyContent } from "@/lib/domain-logic/modifyContent";
import { camelCaseToKebabCase } from "@/lib/utils/cases-helpers";
import Onboarding from "@/pages/onboarding";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  DateObject,
  Municipality,
  UserData,
  createEmptyUserData,
  emptyIndustrySpecificData,
  generateUser,
  getIndustries,
  industrySpecificDataChoices,
} from "@businessnjgovnavigator/shared/";
import { ThemeProvider, createTheme } from "@mui/material";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();

export const renderPage = ({
  municipalities,
  userData,
  isAuthenticated,
}: {
  municipalities?: Municipality[];
  userData?: UserData | null;
  isAuthenticated?: IsAuthenticated;
}): { page: PageHelpers } => {
  const currentUser = userData?.user ?? generateUser({});
  render(
    withAuth(
      <WithStatefulUserData
        initialUserData={
          userData === undefined
            ? createEmptyUserData(currentUser)
            : userData === null
              ? undefined
              : userData
        }
      >
        <ThemeProvider theme={createTheme()}>
          <Onboarding municipalities={municipalities || []} />
        </ThemeProvider>
      </WithStatefulUserData>,
      { activeUser: { ...currentUser, encounteredMyNjLinkingError: false }, isAuthenticated },
    ),
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
  getRadioButton: (label: string) => HTMLElement;
  getMunicipalityValue: () => string;
  getFullNameValue: () => string;
  getEmailValue: () => string;
  getConfirmEmailValue: () => string;
  visitStep: (step: number) => Promise<void>;
  chooseEssentialQuestionRadio: (industryId: string, indexOfDataChoice: number) => void;
};

export const createPageHelpers = (): PageHelpers => {
  const fillText = (label: string, value: string): void => {
    const item = screen.getByLabelText(label);
    fireEvent.change(item, { target: { value: value } });
    fireEvent.blur(item);
  };

  const selectDate = (label: string, value: DateObject): void => {
    fillText(label, value.format("MM/YYYY"));
    fireEvent.blur(screen.getByLabelText("Date of formation"));
  };

  const selectByValue = (label: string, value: string): void => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectByText = (label: string, value: string): void => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const chooseRadio = (value: string): void => {
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
    return (screen.queryByTestId("industryId") as HTMLInputElement)?.value;
  };

  const getRadioButton = (label: string): HTMLElement => {
    return screen.getByLabelText(label);
  };

  const getMunicipalityValue = (): string => {
    return (screen.queryByTestId("municipality") as HTMLInputElement)?.value;
  };

  const getLegalStructureValue = (): string => {
    return (screen.queryByTestId("legal-structure") as HTMLInputElement)?.value;
  };

  const getFullNameValue = (): string => {
    return (screen.queryByLabelText(Config.selfRegistration.nameFieldLabel) as HTMLInputElement)
      ?.value;
  };

  const getEmailValue = (): string => {
    return (screen.queryByLabelText(Config.selfRegistration.emailFieldLabel) as HTMLInputElement)
      ?.value;
  };

  const getConfirmEmailValue = (): string => {
    return (
      screen.queryByLabelText(Config.selfRegistration.confirmEmailFieldLabel) as HTMLInputElement
    )?.value;
  };

  const visitStep = async (step: number): Promise<void> => {
    clickNext();
    const currentStep = step - 1;
    await waitForElementToBeRemoved(() => {
      return screen.getByTestId(`step-${currentStep}`);
    });
    expect(screen.getByTestId(`step-${step}`)).toBeInTheDocument();
  };

  const checkByLabelText = (label: string): void => {
    fireEvent.click(screen.getByLabelText(label));
  };

  const chooseEssentialQuestionRadio = (
    industryId: string,
    indexOfIndustrySpecificDataChoices: number,
  ): void => {
    const essentialQuestions = getEssentialQuestion(industryId);

    for (const essentialQuestion of essentialQuestions) {
      const value =
        industrySpecificDataChoices[essentialQuestion.fieldName][
          indexOfIndustrySpecificDataChoices
        ];
      fireEvent.click(
        screen.getByTestId(
          `${camelCaseToKebabCase(essentialQuestion.fieldName)}-radio-${value
            .toString()
            .toLowerCase()}`,
        ),
      );
    }
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

export const mockEmptyApiSignups = (): void => {
  mockApi.postGetAnnualFilings.mockImplementation((request) => {
    return Promise.resolve(request);
  });
};

export const mockSuccessfulApiSignups = (): void => {
  mockApi.postGetAnnualFilings.mockImplementation((request) => {
    return Promise.resolve(request);
  });
};

export const industriesWithSingleEssentialQuestion = getIndustries().filter((industry) => {
  return (
    hasEssentialQuestion(industry.id) &&
    industry.isEnabled &&
    !hasMultipleEssentialQuestions(industry.id)
  );
});

export const industriesWithOutEssentialQuestion = getIndustries().filter((industry) => {
  return !hasEssentialQuestion(industry.id) && industry.isEnabled;
});

export const industryIdsWithOutEssentialQuestion = industriesWithOutEssentialQuestion.map(
  (industry) => industry.id,
);

export const industryIdsWithSingleEssentialQuestion = industriesWithSingleEssentialQuestion.map(
  (industry) => industry.id,
);

export const industryIdsWithSingleRequiredEssentialQuestion =
  industryIdsWithSingleEssentialQuestion.filter((industry) => {
    const applicableQuestions = EssentialQuestions.filter(
      (question) =>
        question.isQuestionApplicableToIndustryId(industry) && industry !== "employment-agency",
    );
    const someQuestionsStartAsUndefined = applicableQuestions.some((question) => {
      return emptyIndustrySpecificData[question.fieldName] === undefined;
    });
    return someQuestionsStartAsUndefined;
  });

export const composeOnBoardingTitle = (step: string, pageTitle?: string): string => {
  const Config = getMergedConfig();
  if (pageTitle === undefined) {
    const pageTitleDefault = modifyContent({
      content: Config.onboardingDefaults.pageTitle,
      condition: () => false,
      modificationMap: {
        Additional: "Additional",
        additional: "additional",
      },
    });
    // return `${pageTitleDefault} ${step}`;
    return `${[pageTitleDefault, step].join(" ")}`;
  }
  // return `${pageTitle} ${step}`;
  return `${[pageTitle, step].join(" ")}`;
};

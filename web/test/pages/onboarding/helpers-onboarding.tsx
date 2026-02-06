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
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { ThemeProvider, createTheme } from "@mui/material";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
  selectByValue: (label: string, value: string) => Promise<void>;
  selectByText: (label: string, value: string) => Promise<void>;
  checkByLabelText: (label: string) => Promise<void>;
  chooseRadio: (value: string) => Promise<void>;
  clickNext: () => Promise<void>;
  clickBack: () => Promise<void>;
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
  chooseEssentialQuestionRadio: (industryId: string, indexOfDataChoice: number) => Promise<void>;
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

  const selectByValue = async (label: string, value: string): Promise<void> => {
    const input = await screen.findByLabelText(label);
    // MUI Select requires fireEvent for both opening and selecting options
    fireEvent.mouseDown(input);
    // Get the listbox ID from aria-controls to avoid cross-test contamination in parallel execution
    const listboxId = input.getAttribute("aria-controls");
    if (!listboxId) {
      throw new Error(`Input for "${label}" does not have aria-controls attribute`);
    }

    // Perform entire operation atomically within waitFor to handle React 19 concurrent rendering
    // and prevent race conditions when listbox is removed/recreated between steps
    await waitFor(
      () => {
        const listbox = document.getElementById(listboxId);
        if (!listbox) {
          throw new Error(`Listbox with id "${listboxId}" not found yet`);
        }
        const option = within(listbox).queryByTestId(value);
        if (!option) {
          throw new Error(`Option with testid "${value}" not found in listbox yet`);
        }
        fireEvent.click(option);
      },
      { timeout: 5000 },
    );
    // Wait for listbox to close after selection to ensure UI is in stable state
    await waitFor(
      () => {
        const listbox = document.getElementById(listboxId);
        if (listbox) {
          throw new Error("Listbox should have closed after selection");
        }
      },
      { timeout: 3000 },
    );
  };

  const selectByText = async (label: string, value: string): Promise<void> => {
    const input = await screen.findByLabelText(label);
    // MUI Select requires fireEvent for both opening and selecting options
    fireEvent.mouseDown(input);
    // Get the listbox ID from aria-controls to avoid cross-test contamination in parallel execution
    const listboxId = input.getAttribute("aria-controls");
    if (!listboxId) {
      throw new Error(`Input for "${label}" does not have aria-controls attribute`);
    }

    // Perform entire operation atomically within waitFor to handle React 19 concurrent rendering
    // and prevent race conditions when listbox is removed/recreated between steps
    await waitFor(
      () => {
        const listbox = document.getElementById(listboxId);
        if (!listbox) {
          throw new Error(`Listbox with id "${listboxId}" not found yet`);
        }
        const option = within(listbox).queryByText(value);
        if (!option) {
          throw new Error(`Option "${value}" not found in listbox yet`);
        }
        fireEvent.click(option);
      },
      { timeout: 5000 },
    );
    // Wait for listbox to close after selection to ensure UI is in stable state
    await waitFor(
      () => {
        const listbox = document.getElementById(listboxId);
        if (listbox) {
          throw new Error("Listbox should have closed after selection");
        }
      },
      { timeout: 3000 },
    );
  };

  const chooseRadio = async (value: string): Promise<void> => {
    const element = await screen.findByTestId(value);
    await userEvent.click(element);
  };

  const clickNext = async (): Promise<void> => {
    const buttons = await screen.findAllByTestId("next");
    await userEvent.click(buttons[0]);
  };

  const clickBack = async (): Promise<void> => {
    const buttons = await screen.findAllByTestId("back");
    await userEvent.click(buttons[0]);
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
    await clickNext();
    const currentStep = step - 1;
    // Wait for the current step to be removed (if it's still there)
    const currentStepElement = screen.queryByTestId(`step-${currentStep}`);
    if (currentStepElement) {
      // Increase timeout to 120 seconds to handle resource contention during parallel test execution on slow CI runners
      // React 19's concurrent rendering + parallel test execution can cause significant delays
      // Tests pass individually but fail under load due to async rendering taking longer
      await waitForElementToBeRemoved(currentStepElement, { timeout: 120000 });
    }
    // Wait for the next step to appear
    await screen.findByTestId(`step-${step}`, {}, { timeout: 120000 });
  };

  const checkByLabelText = async (label: string): Promise<void> => {
    const element = await screen.findByLabelText(label);
    await userEvent.click(element);
  };

  const chooseEssentialQuestionRadio = async (
    industryId: string,
    indexOfIndustrySpecificDataChoices: number,
  ): Promise<void> => {
    const essentialQuestions = getEssentialQuestion(industryId);

    for (const essentialQuestion of essentialQuestions) {
      const value =
        industrySpecificDataChoices[essentialQuestion.fieldName][
          indexOfIndustrySpecificDataChoices
        ];
      const radioButton = await screen.findByTestId(
        `${camelCaseToKebabCase(essentialQuestion.fieldName)}-radio-${value
          .toString()
          .toLowerCase()}`,
      );
      await userEvent.click(radioButton);
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

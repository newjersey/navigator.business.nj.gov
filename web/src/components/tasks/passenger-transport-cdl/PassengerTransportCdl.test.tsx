import { PassengerTransportCdl } from "@/components/tasks/passenger-transport-cdl/PassengerTransportCdl";
import { generateTask } from "@/test/factories";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generateRoadmapTaskData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

describe("<PassengerTransportCdl />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  const theme = createTheme();

  const task = generateTask({
    id: "passenger-transport-cdl",
    name: "Passenger Transport CDL",
  });

  const renderComponent = ({
    business = generateBusiness({
      roadmapTaskData: generateRoadmapTaskData({
        passengerTransportSchoolBus: undefined,
        passengerTransportSixteenOrMorePassengers: undefined,
      }),
    }),
  } = {}): void => {
    render(
      <ThemeProvider theme={theme}>
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
          <PassengerTransportCdl task={task} />
        </WithStatefulUserData>
      </ThemeProvider>,
    );
  };

  it("displays tooltip when hovering over disabled checkbox", async () => {
    renderComponent();
    const user = userEvent.setup();
    const checkbox = within(screen.getByTestId("taskProgress")).getByRole("checkbox");
    await user.hover(checkbox);
    await waitFor(() => {
      expect(
        screen.getByText(Config.passengerTransportCdlTabOne.disabledTooltipText),
      ).toBeInTheDocument();
    });
  });

  it("navigates to the results tab after answering both questions and submitting", async () => {
    renderComponent();
    answerBothQuestionsAndSubmit();
    await waitFor(() => {
      expect(
        screen.queryByRole("radiogroup", {
          name: Config.passengerTransportCdlTabOne.firstQuestionLabel,
        }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole("radiogroup", {
        name: Config.passengerTransportCdlTabOne.secondQuestionLabel,
      }),
    ).not.toBeInTheDocument();
  });

  it("updates task to completed when answering both questions and submitting", async () => {
    renderComponent();
    answerBothQuestionsAndSubmit();
    await waitFor(() => {
      expect(currentBusiness().taskProgress["passenger-transport-cdl"]).toBe("COMPLETED");
    });
  });

  describe("errors", () => {
    it("displays error alert and inline error when only second question is answered", async () => {
      renderComponent();
      selectSecondQuestionNo();
      fireEvent.click(submitButton());
      await waitFor(() => {
        expect(pageLevelAlert()).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.passengerTransportCdlTabOne.pageLevelAlertText),
      ).toBeInTheDocument();
      const error = screen.getByTestId("passenger-transport-school-bus-error");
      expect(error).toBeInTheDocument();
    });

    it("displays error alert and inline error when only first question is answered", async () => {
      renderComponent();
      selectFirstQuestionYes();
      fireEvent.click(submitButton());
      await waitFor(() => {
        expect(pageLevelAlert()).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.passengerTransportCdlTabOne.pageLevelAlertText),
      ).toBeInTheDocument();
      const error = screen.getByTestId("passenger-transport-sixteen-or-more-passengers-error");
      expect(error).toBeInTheDocument();
    });

    it("displays error alert and inline errors when no questions are answered", async () => {
      renderComponent();
      fireEvent.click(submitButton());
      await waitFor(() => {
        expect(pageLevelAlert()).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.passengerTransportCdlTabOne.pageLevelAlertText),
      ).toBeInTheDocument();
      const error1 = screen.getByTestId("passenger-transport-school-bus-error");
      expect(error1).toBeInTheDocument();
      const error2 = screen.getByTestId("passenger-transport-sixteen-or-more-passengers-error");
      expect(error2).toBeInTheDocument();
      await waitFor(() => {
        expect(pageLevelAlert()).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.passengerTransportCdlTabOne.pageLevelAlertText),
      ).toBeInTheDocument();
    });

    it("removes error messages when both questions are answered after validation error", async () => {
      renderComponent();
      fireEvent.click(submitButton());
      await waitFor(() => {
        expect(pageLevelAlert()).toBeInTheDocument();
      });
      expect(
        screen.getByText(Config.passengerTransportCdlTabOne.pageLevelAlertText),
      ).toBeInTheDocument();
      const error1 = screen.getByTestId("passenger-transport-school-bus-error");
      expect(error1).toBeInTheDocument();
      const error2 = screen.getByTestId("passenger-transport-sixteen-or-more-passengers-error");
      expect(error2).toBeInTheDocument();
      selectFirstQuestionYes();
      selectSecondQuestionNo();
      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId("passenger-transport-school-bus-error")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("passenger-transport-sixteen-or-more-passengers-error"),
      ).not.toBeInTheDocument();
    });
  });

  describe("edit button", () => {
    it("return user to the first tab when edit button is clicked", async () => {
      renderComponent();
      answerBothQuestionsAndSubmit();

      await waitFor(() => {
        expect(
          screen.getByText(Config.passengerTransportCdlTabTwo.successAlertText),
        ).toBeInTheDocument();
      });
      clickOnEditButton();

      await waitFor(() => {
        expect(
          screen.queryByText(Config.passengerTransportCdlTabTwo.successAlertText),
        ).not.toBeInTheDocument();
      });
    });

    it("resets task status to TO_DO and boolean values to undefined", async () => {
      renderComponent();
      answerBothQuestionsAndSubmit();

      await waitFor(() => {
        expect(
          screen.getByText(Config.passengerTransportCdlTabTwo.successAlertText),
        ).toBeInTheDocument();
      });
      clickOnEditButton();

      await waitFor(() => {
        expect(
          screen.queryByText(Config.passengerTransportCdlTabTwo.successAlertText),
        ).not.toBeInTheDocument();
      });

      expect(currentBusiness().taskProgress["passenger-transport-cdl"]).toBe("TO_DO");
      expect(currentBusiness().roadmapTaskData.passengerTransportSchoolBus).toBeUndefined();
      expect(
        currentBusiness().roadmapTaskData.passengerTransportSixteenOrMorePassengers,
      ).toBeUndefined();
    });

    it("retains previously selected input values", async () => {
      renderComponent();
      answerBothQuestionsAndSubmit();

      await waitFor(() => {
        expect(
          screen.getByText(Config.passengerTransportCdlTabTwo.successAlertText),
        ).toBeInTheDocument();
      });
      clickOnEditButton();

      await waitFor(() => {
        expect(
          screen.queryByText(Config.passengerTransportCdlTabTwo.successAlertText),
        ).not.toBeInTheDocument();
      });
    });
  });

  it("return user to the first tab when edit button is clicked", async () => {
    renderComponent();
    answerBothQuestionsAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByText(Config.passengerTransportCdlTabTwo.successAlertText),
      ).toBeInTheDocument();
    });
    clickOnEditButton();

    await waitFor(() => {
      expect(
        screen.queryByText(Config.passengerTransportCdlTabTwo.successAlertText),
      ).not.toBeInTheDocument();
    });
    expect(
      within(getFirstRadioGroup()).getByRole("radio", {
        name: Config.passengerTransportCdlTabOne.firstQuestionTrueText,
      }),
    ).toBeChecked();

    expect(
      within(getSecondRadioGroup()).getByRole("radio", {
        name: Config.passengerTransportCdlTabOne.secondQuestionFalseText,
      }),
    ).toBeChecked();
  });

  it("renders class c with p and s endorsement text", async () => {
    renderComponent();
    selectFirstQuestionYes();
    selectSecondQuestionYes();
    fireEvent.click(submitButton());
    await waitFor(() => {
      expect(screen.getByTestId("classCWithS")).toBeInTheDocument();
    });
  });

  it("renders class b with p and s endorsement text", async () => {
    renderComponent();
    selectFirstQuestionYes();
    selectSecondQuestionNo();
    fireEvent.click(submitButton());
    await waitFor(() => {
      expect(screen.getByTestId("classBWithS")).toBeInTheDocument();
    });
  });

  it("renders class c with p endorsement text", async () => {
    renderComponent();
    selectFirstQuestionNo();
    selectSecondQuestionYes();
    fireEvent.click(submitButton());
    await waitFor(() => {
      expect(screen.getByTestId("classCWithoutS")).toBeInTheDocument();
    });
  });

  it("renders class b with p endorsement text", async () => {
    renderComponent();
    selectFirstQuestionNo();
    selectSecondQuestionNo();
    fireEvent.click(submitButton());
    await waitFor(() => {
      expect(screen.getByTestId("classBWithoutS")).toBeInTheDocument();
    });
  });

  const submitButton = (): HTMLElement => {
    return screen.getByRole("button", { name: Config.passengerTransportCdlTabOne.saveButton });
  };

  const pageLevelAlert = (): HTMLElement => {
    return screen.getByRole("alert");
  };

  const getFirstRadioGroup = (): HTMLElement => {
    return screen.getByRole("radiogroup", {
      name: Config.passengerTransportCdlTabOne.firstQuestionLabel,
    });
  };

  const getSecondRadioGroup = (): HTMLElement => {
    return screen.getByRole("radiogroup", {
      name: Config.passengerTransportCdlTabOne.secondQuestionLabel,
    });
  };

  const selectFirstQuestionYes = (): void => {
    const firstRadioGroup = getFirstRadioGroup();
    const firstYesOption = within(firstRadioGroup).getByRole("radio", {
      name: Config.passengerTransportCdlTabOne.firstQuestionTrueText,
    });
    fireEvent.click(firstYesOption);
  };

  const selectFirstQuestionNo = (): void => {
    const firstRadioGroup = getFirstRadioGroup();
    const firstNoOption = within(firstRadioGroup).getByRole("radio", {
      name: Config.passengerTransportCdlTabOne.secondQuestionFalseText,
    });
    fireEvent.click(firstNoOption);
  };

  const selectSecondQuestionNo = (): void => {
    const secondRadioGroup = getSecondRadioGroup();
    const secondNoOption = within(secondRadioGroup).getByRole("radio", {
      name: Config.passengerTransportCdlTabOne.secondQuestionFalseText,
    });
    fireEvent.click(secondNoOption);
  };

  const selectSecondQuestionYes = (): void => {
    const secondRadioGroup = getSecondRadioGroup();
    const secondYesOption = within(secondRadioGroup).getByRole("radio", {
      name: Config.passengerTransportCdlTabOne.secondQuestionTrueText,
    });
    fireEvent.click(secondYesOption);
  };

  const answerBothQuestionsAndSubmit = (): void => {
    selectFirstQuestionYes();
    selectSecondQuestionNo();
    fireEvent.click(submitButton());
  };

  const clickOnEditButton = (): void => {
    fireEvent.click(screen.getByText(Config.passengerTransportCdlTabTwo.successAlertButtonText));
  };
});

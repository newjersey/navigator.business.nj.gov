import { TaskProgressCheckbox } from "@/components/TaskProgressCheckbox";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { getTaskStatusUpdatedMessage } from "@/lib/utils/helpers";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { selectDate } from "@/test/helpers/helpers-testing-library-selectors";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  defaultDateFormat,
  formationTaskId,
  generateBusiness,
  generateFormationData,
  generateFormationSubmitResponse,
  generateProfileData,
  generateUserDataForBusiness,
  getCurrentDate,
  TaskProgress,
  taxTaskId,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));

const Config = getMergedConfig();
let setShowNeedsAccountModal: jest.Mock;

describe("<TaskProgressCheckbox />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setShowNeedsAccountModal = jest.fn();
    useMockRoadmap({});
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  const renderTaskCheckbox = (taskId: string, initialBusiness: Business): void => {
    render(
      <MunicipalitiesContext.Provider value={{ municipalities: [] }}>
        <ThemeProvider theme={createTheme()}>
          <WithStatefulUserData initialUserData={generateUserDataForBusiness(initialBusiness)}>
            <TaskProgressCheckbox taskId={taskId} disabledTooltipText={undefined} />
          </WithStatefulUserData>
        </ThemeProvider>
      </MunicipalitiesContext.Provider>
    );
  };

  const renderTaskCheckboxWithAuthAlert = (taskId: string, initialBusiness: Business): void => {
    render(
      withNeedsAccountContext(
        <MunicipalitiesContext.Provider value={{ municipalities: [] }}>
          <WithStatefulUserData initialUserData={generateUserDataForBusiness(initialBusiness)}>
            <TaskProgressCheckbox taskId={taskId} disabledTooltipText={undefined} />
          </WithStatefulUserData>
        </MunicipalitiesContext.Provider>,
        IsAuthenticated.FALSE,
        { showNeedsAccountModal: false, setShowNeedsAccountModal: setShowNeedsAccountModal }
      )
    );
  };

  it("displays To Do status when user data does not contain status", () => {
    renderTaskCheckbox("123", generateBusiness({}));
    expect(screen.getByText(Config.taskProgress.TO_DO)).toBeInTheDocument();
  });

  it("displays task status from user data", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
      [taskId]: "TO_DO",
    };
    renderTaskCheckbox(taskId, generateBusiness({ taskProgress }));
    expect(screen.getByText(Config.taskProgress.TO_DO)).toBeInTheDocument();
  });

  it("updates task status when progress checkbox is clicked", async () => {
    const user = userEvent.setup();
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = { "some-id": "COMPLETED" };

    renderTaskCheckbox(taskId, generateBusiness({ taskProgress }));

    await user.click(screen.getByTestId("change-task-progress-checkbox"));
    await waitFor(() => {
      return expect(currentBusiness().taskProgress).toEqual({
        "some-id": "COMPLETED",
        [taskId]: "COMPLETED",
      });
    });
    await screen.findByText(Config.taskProgress.COMPLETED);

    await user.click(screen.getByTestId("change-task-progress-checkbox"));
    await waitFor(() => {
      return expect(currentBusiness().taskProgress).toEqual({
        "some-id": "COMPLETED",
        [taskId]: "TO_DO",
      });
    });
    await screen.findByText(Config.taskProgress.COMPLETED);

    await user.click(screen.getByTestId("change-task-progress-checkbox"));
    await waitFor(() => {
      return expect(currentBusiness().taskProgress).toEqual({
        "some-id": "COMPLETED",
        [taskId]: "TO_DO",
      });
    });
    await screen.findByText(Config.taskProgress.TO_DO);
  });

  it("shows a success snackbar when an option is selected", async () => {
    const user = userEvent.setup();
    renderTaskCheckbox("123", generateBusiness({}));
    expect(screen.queryByText(getTaskStatusUpdatedMessage("COMPLETED"))).not.toBeInTheDocument();

    await user.click(screen.getByTestId("change-task-progress-checkbox"));
    await screen.findByText(getTaskStatusUpdatedMessage("COMPLETED"));
  });

  it("opens Needs Account modal for guest mode user when checkbox is clicked", async () => {
    const user = userEvent.setup();
    renderTaskCheckboxWithAuthAlert("123", generateBusiness({}));
    await user.click(screen.getByTestId("change-task-progress-checkbox"));
    await waitFor(() => {
      return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });
  });

  describe("tax registration warning modal", () => {
    it("shows the warning modal if the user tries to change status from completed", async () => {
      const user = userEvent.setup();

      const userData = generateBusiness({
        taskProgress: { [taxTaskId]: "COMPLETED" },
      });

      renderTaskCheckbox(taxTaskId, userData);
      await user.click(screen.getByTestId("change-task-progress-checkbox"));
      expect(screen.getByText(Config.registeredForTaxesModal.areYouSureTaxBody)).toBeInTheDocument();
    });

    it("updates the task progress if the user continues in the warning modal", async () => {
      const user = userEvent.setup();

      const userData = generateBusiness({
        taskProgress: { [taxTaskId]: "COMPLETED" },
      });

      renderTaskCheckbox(taxTaskId, userData);
      await user.click(screen.getByTestId("change-task-progress-checkbox"));

      await user.click(screen.getByText(Config.registeredForTaxesModal.areYouSureTaxContinueButton));
      await screen.findByText(Config.taskProgress.TO_DO);
      expect(currentBusiness().taskProgress[taxTaskId]).toEqual("TO_DO");
    });

    it("doesn't update the task progress if the user cancels in the warning modal", async () => {
      const user = userEvent.setup();

      const userData = generateBusiness({
        taskProgress: {
          [taxTaskId]: "COMPLETED",
        },
      });

      renderTaskCheckbox(taxTaskId, userData);
      await user.click(screen.getByTestId("change-task-progress-checkbox"));
      await user.click(screen.getByText(Config.registeredForTaxesModal.areYouSureTaxCancelButton));
      expect(screen.getByText(Config.taskProgress.COMPLETED)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });
  });

  describe("formation completion", () => {
    it("opens formation date modal when task changed to complete", async () => {
      const user = userEvent.setup();
      renderTaskCheckbox(formationTaskId, generateBusiness({}));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();
      await selectCompleted(user);
      expect(screen.getByText(Config.formationDateModal.header)).toBeInTheDocument();
    });

    it("does not open modal when task changed to TO_DO", async () => {
      const user = userEvent.setup();
      renderTaskCheckbox(
        formationTaskId,
        generateBusiness({
          taskProgress: { [formationTaskId]: "COMPLETED" },
        })
      );
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();

      await user.click(screen.getByTestId("change-task-progress-checkbox"));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();

      await user.click(screen.getByTestId("change-task-progress-checkbox"));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();
    });

    it("does not update status when modal opens", async () => {
      const user = userEvent.setup();
      renderTaskCheckbox(
        formationTaskId,
        generateBusiness({
          taskProgress: { [formationTaskId]: "TO_DO" },
        })
      );
      await user.click(screen.getByTestId("change-task-progress-checkbox"));
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toBe(true);
      });
    });

    it("does not update status when modal is closed", async () => {
      const user = userEvent.setup();
      renderTaskCheckbox(
        formationTaskId,
        generateBusiness({
          taskProgress: { [formationTaskId]: "TO_DO" },
        })
      );
      await user.click(screen.getByTestId("change-task-progress-checkbox"));
      await user.click(screen.getByText(Config.formationDateModal.cancelButtonText));
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toBe(true);
      });
    });

    it("updates status and date of formation, and redirects user on save", async () => {
      const user = userEvent.setup();
      jest.useFakeTimers();
      const id = formationTaskId;
      const startingPersonaForRoadmapUrl = generateProfileData({ businessPersona: "STARTING" });
      renderTaskCheckbox(formationTaskId, generateBusiness({ profileData: startingPersonaForRoadmapUrl }));
      await waitFor(() => {
        return selectCompleted(user);
      });
      act(() => {
        jest.advanceTimersByTime(7000);
      });

      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      await waitFor(() => {
        return user.click(screen.getByText(Config.formationDateModal.saveButtonText));
      });
      await waitFor(() => {
        expect(screen.queryByText(getTaskStatusUpdatedMessage("COMPLETED"))).not.toBeInTheDocument();
      });
      await waitFor(() => {
        return expect(currentBusiness().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
      });
      expect(currentBusiness().taskProgress[id]).toEqual("COMPLETED");
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.dashboard,
        query: { fromFormBusinessEntity: "true" },
      });
    });

    it("shows warning modal and sets dateOfFormation to undefined if user sets back to not completed", async () => {
      const user = userEvent.setup();
      renderTaskCheckbox(
        formationTaskId,
        generateBusiness({
          profileData: generateProfileData({ businessPersona: "STARTING" }),
        })
      );
      await waitFor(() => {
        return selectCompleted(user);
      });
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      await waitFor(() => {
        user.click(screen.getByText(Config.formationDateModal.saveButtonText));
      });
      await waitFor(() => {
        return expect(currentBusiness().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
      });
      await waitFor(() => {
        return user.click(screen.getByTestId("change-task-progress-checkbox"));
      });
      expect(screen.getByText(Config.formationDateModal.areYouSureModalHeader)).toBeInTheDocument();
      await waitFor(() => {
        return user.click(screen.getByText(Config.formationDateModal.areYouSureModalContinueButtonText));
      });
      await waitFor(() => {
        return expect(currentBusiness().profileData.dateOfFormation).toBeUndefined();
      });
    });

    it("does not show warning modal if status is not already completed", async () => {
      const user = userEvent.setup();
      renderTaskCheckbox(formationTaskId, generateBusiness({}));
      await waitFor(() => {
        return user.click(screen.getByTestId("change-task-progress-checkbox"));
      });
      expect(screen.queryByText(Config.formationDateModal.areYouSureModalHeader)).not.toBeInTheDocument();
    });

    it("does not update dateOfFormation or status if user changes their mind", async () => {
      const user = userEvent.setup();
      const id = formationTaskId;
      renderTaskCheckbox(
        formationTaskId,
        generateBusiness({
          profileData: generateProfileData({ businessPersona: "STARTING" }),
        })
      );
      await waitFor(() => {
        return selectCompleted(user);
      });
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      await waitFor(() => {
        return user.click(screen.getByText(Config.formationDateModal.saveButtonText));
      });
      await waitFor(() => {
        return expect(currentBusiness().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
      });
      await waitFor(() => {
        user.click(screen.getByTestId("change-task-progress-checkbox"));
      });
      await waitFor(() => {
        user.click(screen.getAllByText(Config.formationDateModal.areYouSureModalCancelButtonText)[0]);
      });
      expect(currentBusiness().taskProgress[id]).toEqual("COMPLETED");
      expect(currentBusiness().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
    });
  });

  describe("wire mock is true", () => {
    const originalEnvironment = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnvironment,
        USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH: "true",
      };
    });

    afterEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnvironment,
      };
    });

    it("updates task progress for wiremock formation completion when true", () => {
      const id = formationTaskId;
      renderTaskCheckbox(
        formationTaskId,
        generateBusiness({
          profileData: generateProfileData({ businessPersona: "STARTING" }),
          formationData: generateFormationData({
            completedFilingPayment: true,
            formationResponse: generateFormationSubmitResponse({
              success: true,
            }),
          }),
        })
      );

      expect(currentBusiness().taskProgress[id]).toEqual("COMPLETED");
    });
  });

  const selectCompleted = async (user: UserEvent): Promise<void> => {
    await user.click(screen.getByTestId("change-task-progress-checkbox"));
    await screen.findByText(Config.taskProgress.TO_DO);
  };
});

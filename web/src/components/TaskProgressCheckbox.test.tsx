import { TaskProgressCheckbox } from "@/components/TaskProgressCheckbox";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { generateProfileData, generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { selectDate } from "@/test/helpers/helpers-testing-library-selectors";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  defaultDateFormat,
  formationTaskId,
  getCurrentDate,
  randomInt,
  TaskProgress,
  taxTaskId,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/roadmap/buildUserRoadmap", () => {
  return { buildUserRoadmap: jest.fn() };
});

const Config = getMergedConfig();
let setRegistrationModalIsVisible: jest.Mock;

describe("<TaskProgressCheckbox />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setRegistrationModalIsVisible = jest.fn();
    useMockRoadmap({});
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  const renderTaskCheckbox = (taskId: string, initialUserData?: UserData) => {
    return render(
      <MunicipalitiesContext.Provider value={{ municipalities: [] }}>
        <ThemeProvider theme={createTheme()}>
          <WithStatefulUserData initialUserData={initialUserData}>
            <TaskProgressCheckbox taskId={taskId} disabledTooltipText={undefined} />
          </WithStatefulUserData>
        </ThemeProvider>
      </MunicipalitiesContext.Provider>
    );
  };

  const renderTaskCheckboxWithAuthAlert = (taskId: string, initialUserData?: UserData) => {
    render(
      withAuthAlert(
        <MunicipalitiesContext.Provider value={{ municipalities: [] }}>
          <WithStatefulUserData initialUserData={initialUserData}>
            <TaskProgressCheckbox taskId={taskId} disabledTooltipText={undefined} />
          </WithStatefulUserData>
        </MunicipalitiesContext.Provider>,
        IsAuthenticated.FALSE,
        { registrationModalIsVisible: false, setRegistrationModalIsVisible }
      )
    );
  };

  it("displays Not Started status when user data does not contain status", () => {
    renderTaskCheckbox("123", generateUserData({}));
    expect(screen.getByText(Config.taskProgress.NOT_STARTED)).toBeInTheDocument();
  });

  it("displays task status from user data", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
      [taskId]: "IN_PROGRESS",
    };
    renderTaskCheckbox(taskId, generateUserData({ taskProgress }));
    expect(screen.getByText(Config.taskProgress.IN_PROGRESS)).toBeInTheDocument();
  });

  it("cycles through updating task status when progress checkbox is clicked", async () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = { "some-id": "COMPLETED" };

    renderTaskCheckbox(taskId, generateUserData({ taskProgress }));

    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
    await waitFor(() => {
      return expect(currentUserData().taskProgress).toEqual({
        "some-id": "COMPLETED",
        [taskId]: "IN_PROGRESS",
      });
    });
    await screen.findByText(Config.taskProgress.IN_PROGRESS);

    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
    await waitFor(() => {
      return expect(currentUserData().taskProgress).toEqual({
        "some-id": "COMPLETED",
        [taskId]: "COMPLETED",
      });
    });
    await screen.findByText(Config.taskProgress.COMPLETED);
  });

  it("shows a success snackbar when an option is selected", async () => {
    renderTaskCheckbox("123", generateUserData({}));
    expect(screen.queryByText(Config.taskDefaults.taskProgressSuccessSnackbarBody)).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
    await screen.findByText(Config.taskDefaults.taskProgressSuccessSnackbarBody);
  });

  it("opens registration modal for guest mode user when checkbox is clicked", async () => {
    renderTaskCheckboxWithAuthAlert("123", generateUserData({}));
    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
    await waitFor(() => {
      return expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
    });
  });

  describe("tax registration modal", () => {
    it("opens when tax task is marked complete", async () => {
      const userData = generateUserData({
        taskProgress: { [taxTaskId]: "NOT_STARTED" },
      });
      renderTaskCheckbox(taxTaskId, userData);
      await selectCompleted();
      expect(screen.getByText(Config.taxRegistrationModal.title)).toBeInTheDocument();
    });

    it("doesn't update the task status when closed", async () => {
      const userData = generateUserData({
        taskProgress: { [taxTaskId]: "IN_PROGRESS" },
      });
      renderTaskCheckbox(taxTaskId, userData);
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.cancelButtonText));
      expect(screen.getByText(Config.taskProgress.IN_PROGRESS)).toBeInTheDocument();
      expect(screen.queryByText(Config.taskProgress.COMPLETED)).not.toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });

    it("updates the task progress when the modal is saved", async () => {
      const userData = generateUserData({
        taskProgress: { [taxTaskId]: "NOT_STARTED" },
        profileData: generateProfileData({ taxId: randomInt(12).toString() }),
      });
      renderTaskCheckbox(taxTaskId, userData);
      await selectCompleted();

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      await screen.findByText(Config.taskProgress.COMPLETED);
      expect(currentUserData().taskProgress[taxTaskId]).toEqual("COMPLETED");
    });

    it("gets redirected to dashboard with the proper query parameter when completed", async () => {
      const userData = generateUserData({
        taskProgress: { [taxTaskId]: "NOT_STARTED" },
        profileData: generateProfileData({ businessPersona: "STARTING", taxId: randomInt(12).toString() }),
      });

      renderTaskCheckbox(taxTaskId, userData);
      await selectCompleted();

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: ROUTES.dashboard,
          query: { fromFormBusinessEntity: "false", fromTaxRegistration: "true" },
        });
      });
    });

    it("shows the warning modal if the user tries to change status from completed", () => {
      const userData = generateUserData({
        taskProgress: { [taxTaskId]: "COMPLETED" },
      });

      renderTaskCheckbox(taxTaskId, userData);
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      expect(screen.getByText(Config.taxRegistrationModal.areYouSureTaxBody)).toBeInTheDocument();
    });

    it("updates the task progress if the user continues in the warning modal", async () => {
      const userData = generateUserData({
        taskProgress: { [taxTaskId]: "COMPLETED" },
      });

      renderTaskCheckbox(taxTaskId, userData);
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.areYouSureTaxContinueButton));
      await screen.findByText(Config.taskProgress.NOT_STARTED);
      expect(currentUserData().taskProgress[taxTaskId]).toEqual("NOT_STARTED");
    });

    it("doesn't update the task progress if the user cancels in the warning modal", async () => {
      const userData = generateUserData({
        taskProgress: {
          [taxTaskId]: "COMPLETED",
        },
      });

      renderTaskCheckbox(taxTaskId, userData);
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      fireEvent.click(screen.getByText(Config.taxRegistrationModal.areYouSureTaxCancelButton));
      expect(screen.getByText(Config.taskProgress.COMPLETED)).toBeInTheDocument();
      expect(userDataWasNotUpdated()).toBe(true);
    });
  });

  describe("formation completion", () => {
    it("opens formation date modal when task changed to complete", async () => {
      renderTaskCheckbox(formationTaskId, generateUserData({}));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();
      await selectCompleted();
      expect(screen.getByText(Config.formationDateModal.header)).toBeInTheDocument();
    });

    it("does not open modal when task changed to unstarted or in-progress", () => {
      renderTaskCheckbox(
        formationTaskId,
        generateUserData({
          taskProgress: { [formationTaskId]: "COMPLETED" },
        })
      );
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();
    });

    it("does not update status when modal opens", async () => {
      renderTaskCheckbox(
        formationTaskId,
        generateUserData({
          taskProgress: { [formationTaskId]: "IN_PROGRESS" },
        })
      );
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toBe(true);
      });
    });

    it("does not update status when modal is closed", async () => {
      renderTaskCheckbox(
        formationTaskId,
        generateUserData({
          taskProgress: { [formationTaskId]: "IN_PROGRESS" },
        })
      );
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      fireEvent.click(screen.getByText(Config.formationDateModal.cancelButtonText));
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toBe(true);
      });
    });

    it("updates status and date of formation, and redirects user on save", async () => {
      const id = formationTaskId;
      const startingPersonaForRoadmapUrl = generateProfileData({ businessPersona: "STARTING" });
      renderTaskCheckbox(formationTaskId, generateUserData({ profileData: startingPersonaForRoadmapUrl }));
      await selectCompleted();
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      await waitFor(() => {
        return expect(currentUserData().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
      });
      expect(currentUserData().taskProgress[id]).toEqual("COMPLETED");
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.dashboard,
        query: { fromFormBusinessEntity: "true", fromTaxRegistration: "false" },
      });
    });

    it("shows warning modal and sets dateOfFormation to undefined if user sets back to not completed", async () => {
      renderTaskCheckbox(
        formationTaskId,
        generateUserData({
          profileData: generateProfileData({ businessPersona: "STARTING" }),
        })
      );
      await selectCompleted();
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      await waitFor(() => {
        return expect(currentUserData().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
      });

      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));

      expect(screen.getByText(Config.formationDateModal.areYouSureModalHeader)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.formationDateModal.areYouSureModalContinueButtonText));
      await waitFor(() => {
        return expect(currentUserData().profileData.dateOfFormation).toBeUndefined();
      });
    });

    it("does not show warning modal if status is not already completed", async () => {
      renderTaskCheckbox(formationTaskId, generateUserData({}));
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      expect(screen.queryByText(Config.formationDateModal.areYouSureModalHeader)).not.toBeInTheDocument();
    });

    it("does not update dateOfFormation or status if user changes their mind", async () => {
      const id = formationTaskId;
      renderTaskCheckbox(
        formationTaskId,
        generateUserData({
          profileData: generateProfileData({ businessPersona: "STARTING" }),
        })
      );
      await selectCompleted();
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      await waitFor(() => {
        return expect(currentUserData().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
      });

      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      fireEvent.click(screen.getAllByText(Config.formationDateModal.areYouSureModalCancelButtonText)[0]);
      expect(currentUserData().taskProgress[id]).toEqual("COMPLETED");
      expect(currentUserData().profileData.dateOfFormation).toEqual(date.format(defaultDateFormat));
    });
  });

  const selectCompleted = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
    await screen.findByText(Config.taskProgress.IN_PROGRESS);
    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
  };
});

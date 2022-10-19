import { TaskProgressCheckbox } from "@/components/TaskProgressCheckbox";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { ROUTES } from "@/lib/domain-logic/routes";
import { generateProfileData, generateUserData } from "@/test/factories";
import { markdownToText, withAuthAlert } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { formationTaskId, taxTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { LegalStructures } from "@businessnjgovnavigator/shared/legalStructure";
import { TaskProgress, UserData } from "@businessnjgovnavigator/shared/userData";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Dayjs } from "dayjs";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

const randomTradeNameLegalStructure = () => {
  return randomInt() % 2 ? "sole-proprietorship" : "general-partnership";
};

const randomPublicFilingLegalStructure = () => {
  const nonTradeNameLegalStructures = LegalStructures.filter((x) => x.requiresPublicFiling);
  return nonTradeNameLegalStructures[randomInt() % nonTradeNameLegalStructures.length].id;
};
let setRegistrationModalIsVisible: jest.Mock;

describe("<TaskProgressCheckbox />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setRegistrationModalIsVisible = jest.fn();
    useMockRoadmap({});
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  const renderTaskCheckbox = (taskId: string, initialUserData?: UserData) =>
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulUserData initialUserData={initialUserData}>
          <TaskProgressCheckbox taskId={taskId} disabledTooltipText={undefined} />
        </WithStatefulUserData>
      </ThemeProvider>
    );

  const renderTaskCheckboxWithAuthAlert = (taskId: string, initialUserData?: UserData) => {
    render(
      withAuthAlert(
        <WithStatefulUserData initialUserData={initialUserData}>
          <TaskProgressCheckbox taskId={taskId} disabledTooltipText={undefined} />
        </WithStatefulUserData>,
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
    await waitFor(() =>
      expect(currentUserData().taskProgress).toEqual({
        "some-id": "COMPLETED",
        [taskId]: "IN_PROGRESS",
      })
    );
    await screen.findByText(Config.taskProgress.IN_PROGRESS);

    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
    await waitFor(() =>
      expect(currentUserData().taskProgress).toEqual({
        "some-id": "COMPLETED",
        [taskId]: "COMPLETED",
      })
    );
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
    await waitFor(() => expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true));
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
        profileData: generateProfileData({ businessPersona: "STARTING" }),
      });

      renderTaskCheckbox(taxTaskId, userData);
      await selectCompleted();

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: routeForPersona(userData.profileData.businessPersona),
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

    describe("when trade name legal structure", () => {
      it("shows all fields except business name and tax field", async () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            legalStructureId: randomTradeNameLegalStructure(),
          }),
          taskProgress: { [taxTaskId]: "NOT_STARTED" },
        });

        renderTaskCheckbox(taxTaskId, userData);
        await selectCompleted();

        expect(
          screen.queryByText(markdownToText(Config.profileDefaults.STARTING.businessName.header))
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(markdownToText(Config.profileDefaults.STARTING.taxId.header))
        ).not.toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.STARTING.existingEmployees.header))
        ).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.STARTING.ownershipTypeIds.header))
        ).toBeInTheDocument();
      });

      it("saves and redirects with just the ownership and current employees field", async () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            legalStructureId: randomTradeNameLegalStructure(),
          }),
          taskProgress: { [taxTaskId]: "NOT_STARTED" },
        });

        renderTaskCheckbox(taxTaskId, userData);
        await selectCompleted();

        fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith({
            pathname: routeForPersona(userData.profileData.businessPersona),
            query: { fromFormBusinessEntity: "false", fromTaxRegistration: "true" },
          });
        });
      });
    });

    describe("when public filing legal structure", () => {
      it("shows all fields when business name not populated", async () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            businessName: "",
            legalStructureId: randomPublicFilingLegalStructure(),
          }),
          taskProgress: {
            [taxTaskId]: "NOT_STARTED",
          },
        });

        renderTaskCheckbox(taxTaskId, userData);
        await selectCompleted();

        expect(
          screen.getByText(markdownToText(Config.profileDefaults.STARTING.businessName.header))
        ).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.STARTING.taxId.header))
        ).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.STARTING.existingEmployees.header))
        ).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.STARTING.ownershipTypeIds.header))
        ).toBeInTheDocument();
      });

      it("does not show business name field when already populated", async () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            businessName: "test-business",
            legalStructureId: randomPublicFilingLegalStructure(),
          }),
          taskProgress: {
            [taxTaskId]: "NOT_STARTED",
          },
        });

        renderTaskCheckbox(taxTaskId, userData);
        await selectCompleted();

        expect(
          screen.queryByText(markdownToText(Config.profileDefaults.STARTING.businessName.header))
        ).not.toBeInTheDocument();
      });
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
      await waitFor(() => expect(userDataWasNotUpdated()).toBe(true));
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
      await waitFor(() => expect(userDataWasNotUpdated()).toBe(true));
    });

    it("updates status and date of formation, and redirects user on save", async () => {
      const id = formationTaskId;
      const startingPersonaForRoadmapUrl = generateProfileData({ businessPersona: "STARTING" });
      renderTaskCheckbox(formationTaskId, generateUserData({ profileData: startingPersonaForRoadmapUrl }));
      await selectCompleted();
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      await waitFor(() =>
        expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"))
      );
      expect(currentUserData().taskProgress[id]).toEqual("COMPLETED");
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.dashboard,
        query: { fromFormBusinessEntity: "true", fromTaxRegistration: "false" },
      });
    });

    it("allows a date in the future", async () => {
      renderTaskCheckbox(formationTaskId, generateUserData({}));
      await selectCompleted();
      const date = getCurrentDate().add(1, "month").date(1);
      selectDate(date);
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      await waitFor(() =>
        expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"))
      );
    });

    it("shows error when user saves without entering date", async () => {
      renderTaskCheckbox(
        formationTaskId,
        generateUserData({
          profileData: generateProfileData({ dateOfFormation: undefined }),
        })
      );
      await selectCompleted();
      expect(screen.queryByText(Config.formationDateModal.errorText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      expect(screen.getByText(Config.formationDateModal.errorText)).toBeInTheDocument();
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
      await waitFor(() =>
        expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"))
      );

      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));

      expect(screen.getByText(Config.formationDateModal.areYouSureModalHeader)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.formationDateModal.areYouSureModalContinueButtonText));
      await waitFor(() => expect(currentUserData().profileData.dateOfFormation).toBeUndefined());
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
      await waitFor(() =>
        expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"))
      );

      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      fireEvent.click(screen.getAllByText(Config.formationDateModal.areYouSureModalCancelButtonText)[0]);
      expect(currentUserData().taskProgress[id]).toEqual("COMPLETED");
      expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"));
    });
  });

  const selectCompleted = async (): Promise<void> => {
    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
    await screen.findByText(Config.taskProgress.IN_PROGRESS);
    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
  };

  const selectDate = (date: Dayjs) => {
    const item = screen.getByLabelText("Date of formation");
    fireEvent.change(item, { target: { value: date.format("MM/YYYY") } });
    fireEvent.blur(item);
  };
});

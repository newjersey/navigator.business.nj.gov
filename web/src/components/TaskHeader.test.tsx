import { TaskHeader } from "@/components/TaskHeader";
import { getMergedConfig } from "@/contexts/configContext";
import { Task, TaskProgress } from "@/lib/types/types";
import {
  generatePreferences,
  generateProfileData,
  generateStep,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Dayjs } from "dayjs";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const renderTaskHeader = (task: Task, initialUserData?: UserData) =>
  render(
    <WithStatefulUserData initialUserData={initialUserData}>
      <TaskHeader task={task} />
    </WithStatefulUserData>
  );

const Config = getMergedConfig();

describe("<TaskHeader />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    useMockRouter({});
    setupStatefulUserDataContext();
  });

  it("displays Not Started status when user data does not contain status", () => {
    renderTaskHeader(generateTask({}), generateUserData({ taskProgress: {} }));

    expect(screen.getAllByText("Not started")[0]).toBeVisible();
  });

  it("displays task status from user data", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
      [taskId]: "IN_PROGRESS",
    };
    renderTaskHeader(generateTask({ id: taskId }), generateUserData({ taskProgress }));
    expect(screen.getAllByText("In progress")[0]).toBeVisible();
  });

  it("updates task status when progress is selected", async () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
    };

    renderTaskHeader(generateTask({ id: taskId }), generateUserData({ taskProgress }));

    fireEvent.click(screen.getAllByText("Not started")[0]);
    fireEvent.click(screen.getByText("In progress"));
    expect(screen.getAllByText("In progress")[0]).toBeVisible();
    await waitFor(() =>
      expect(currentUserData().taskProgress).toEqual({
        "some-id": "COMPLETED",
        [taskId]: "IN_PROGRESS",
      })
    );
  });

  it("shows a success toast when an option is selected", async () => {
    renderTaskHeader(generateTask({}), generateUserData({}));
    fireEvent.click(screen.getAllByText("Not started")[0]);

    expect(screen.queryByText(Config.taskDefaults.taskProgressSuccessToastBody)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("In progress"));
    await screen.findByText(Config.taskDefaults.taskProgressSuccessToastBody);
  });

  it("displays required tag in header if task is required", () => {
    renderTaskHeader(generateTask({ required: true }));
    expect(screen.getByText(Config.taskDefaults.requiredTagText)).toBeInTheDocument();
  });

  it("does not display required tag in header if task is not required", () => {
    renderTaskHeader(generateTask({ required: false }));
    expect(screen.queryByText(Config.taskDefaults.requiredTagText)).not.toBeInTheDocument();
  });

  it("overrides required tag in header from task in roadmap", () => {
    const id = "123";
    const taskInRoadmap = generateTask({ id, required: false });
    const taskStaticGeneration = generateTask({ id, required: true });
    useMockRoadmap({
      steps: [generateStep({ tasks: [taskInRoadmap], section: "PLAN" })],
    });
    renderTaskHeader(taskStaticGeneration);
    expect(screen.queryByText(Config.taskDefaults.requiredTagText)).not.toBeInTheDocument();
  });

  describe("congratulatory modal", () => {
    it("shows congratulatory modal without link when START section completed", () => {
      const planTaskId = "123";
      const startTaskId = "124";

      const planTask = generateTask({ id: planTaskId });
      const startTask = generateTask({ id: startTaskId });

      const userData = generateUserData({
        taskProgress: {
          [planTaskId]: "COMPLETED",
          [startTaskId]: "NOT_STARTED",
        },
        preferences: generatePreferences({ roadmapOpenSections: ["START"] }),
      });

      useMockRoadmap({
        steps: [
          generateStep({ tasks: [planTask], section: "PLAN" }),
          generateStep({ tasks: [startTask], section: "START" }),
        ],
      });

      renderTaskHeader(startTask, userData);
      changeTaskNotStartedToCompleted();

      expect(currentUserData().taskProgress).toEqual({
        [planTaskId]: "COMPLETED",
        [startTaskId]: "COMPLETED",
      });

      expect(currentUserData().preferences.roadmapOpenSections).toEqual([]);
      expect(
        screen.queryByText(Config.roadmapDefaults.congratulatorModalLinkText, { exact: false })
      ).not.toBeInTheDocument();
    });

    it("shows congratulatory modal with link when PLAN section completed", () => {
      const planTaskId = "123";
      const startTaskId = "124";

      const planTask = generateTask({ id: planTaskId });
      const startTask = generateTask({ id: startTaskId });

      const userData = generateUserData({
        taskProgress: {
          [planTaskId]: "NOT_STARTED",
          [startTaskId]: "NOT_STARTED",
        },
        preferences: generatePreferences({ roadmapOpenSections: ["PLAN", "START"] }),
      });

      useMockRoadmap({
        steps: [
          generateStep({ tasks: [planTask], section: "PLAN" }),
          generateStep({ tasks: [startTask], section: "START" }),
        ],
      });

      renderTaskHeader(planTask, userData);
      changeTaskNotStartedToCompleted();

      expect(currentUserData().taskProgress).toEqual({
        [planTaskId]: "COMPLETED",
        [startTaskId]: "NOT_STARTED",
      });

      expect(currentUserData().preferences.roadmapOpenSections).toEqual(["START"]);
      const link = screen.queryByText(
        `${Config.sectionHeaders["START"]} ${Config.roadmapDefaults.congratulatorModalLinkText}`
      );
      expect(link).toBeInTheDocument();
      fireEvent.click(link as HTMLElement);
      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });
  });

  describe("formation completion", () => {
    const randomFormationId = () => {
      const ids = ["form-business-entity-foreign", "form-business-entity"];
      return ids[Math.floor(Math.random() * ids.length)];
    };

    it("opens formation date modal when task changed to complete", () => {
      renderTaskHeader(generateTask({ id: randomFormationId() }), generateUserData({}));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();
      selectCompleted();
      expect(screen.getByText(Config.formationDateModal.header)).toBeInTheDocument();
      expect(screen.getByText(Config.formationDateModal.description)).toBeInTheDocument();
      expect(screen.getByText(Config.formationDateModal.warningText)).toBeInTheDocument();
    });

    it("does not open modal when task changed to unstarted or in-progress", () => {
      renderTaskHeader(generateTask({ id: randomFormationId() }), generateUserData({}));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();

      fireEvent.click(screen.getAllByText("Not started")[0]);
      fireEvent.click(screen.getByText("In progress"));

      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();
      fireEvent.click(screen.getAllByText("In progress")[0]);
      fireEvent.click(screen.getByText("Not started"));
      expect(screen.queryByText(Config.formationDateModal.header)).not.toBeInTheDocument();
    });

    it("does not update status when modal opens", async () => {
      renderTaskHeader(generateTask({ id: randomFormationId() }), generateUserData({}));
      selectCompleted();
      await waitFor(() => expect(userDataWasNotUpdated()).toBe(true));
    });

    it("does not update status when modal is closed without date", async () => {
      renderTaskHeader(generateTask({ id: randomFormationId() }), generateUserData({}));
      selectCompleted();
      fireEvent.click(screen.getByText(Config.formationDateModal.cancelButtonText));
      await waitFor(() => expect(userDataWasNotUpdated()).toBe(true));
    });

    it("updates status and date of formation, and redirects user on save", async () => {
      const id = randomFormationId();
      renderTaskHeader(
        generateTask({ id }),
        generateUserData({ profileData: generateProfileData({ businessPersona: "STARTING" }) })
      );
      selectCompleted();
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      await waitFor(() =>
        expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"))
      );
      expect(currentUserData().taskProgress[id]).toEqual("COMPLETED");
      expect(mockPush).toHaveBeenCalledWith("/roadmap");
    });

    it("shows error when user saves without entering date", () => {
      const id = randomFormationId();
      renderTaskHeader(
        generateTask({ id }),
        generateUserData({ profileData: generateProfileData({ dateOfFormation: undefined }) })
      );
      selectCompleted();
      expect(screen.queryByText(Config.formationDateModal.errorText)).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      expect(screen.getByText(Config.formationDateModal.errorText)).toBeInTheDocument();
    });

    it("shows warning modal and sets dateOfFormation to undefined if user sets back to not completed", async () => {
      renderTaskHeader(
        generateTask({ id: randomFormationId() }),
        generateUserData({ profileData: generateProfileData({ businessPersona: "STARTING" }) })
      );
      selectCompleted();
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      await waitFor(() =>
        expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"))
      );

      fireEvent.click(screen.getAllByText("Completed")[0]);
      fireEvent.click(screen.getByText("Not started"));
      expect(screen.getByText(Config.formationDateModal.areYouSureModalHeader)).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.formationDateModal.areYouSureModalContinueButtonText));
      await waitFor(() => expect(currentUserData().profileData.dateOfFormation).toBeUndefined());
    });

    it("does not update dateOfFormation or status if user changes their mind", async () => {
      const id = randomFormationId();
      renderTaskHeader(
        generateTask({ id }),
        generateUserData({ profileData: generateProfileData({ businessPersona: "STARTING" }) })
      );
      selectCompleted();
      const date = getCurrentDate().subtract(1, "month").date(1);
      selectDate(date);
      fireEvent.click(screen.getByText(Config.formationDateModal.saveButtonText));
      await waitFor(() =>
        expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"))
      );

      fireEvent.click(screen.getAllByText("Completed")[0]);
      fireEvent.click(screen.getByText("Not started"));
      expect(screen.getByText(Config.formationDateModal.areYouSureModalHeader)).toBeInTheDocument();
      fireEvent.click(screen.getAllByText(Config.formationDateModal.areYouSureModalCancelButtonText)[0]);
      expect(currentUserData().taskProgress[id]).toEqual("COMPLETED");
      expect(currentUserData().profileData.dateOfFormation).toEqual(date.format("YYYY-MM-DD"));
    });
  });

  const selectCompleted = (): void => {
    fireEvent.click(screen.getAllByText("Not started")[0]);
    fireEvent.click(screen.getByText("Completed"));
  };

  const changeTaskNotStartedToCompleted = (): void => {
    selectCompleted();
    expect(screen.getAllByText("Completed")[0]).toBeVisible();
  };

  const selectDate = (date: Dayjs) => {
    const item = screen.getByLabelText("Date of formation");
    fireEvent.change(item, { target: { value: date.format("MM/YYYY") } });
    fireEvent.blur(item);
  };
});

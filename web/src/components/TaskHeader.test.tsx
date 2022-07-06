import { TaskHeader } from "@/components/TaskHeader";
import { Task, TaskProgress } from "@/lib/types/types";
import { generatePreferences, generateStep, generateTask, generateUserData } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const renderTaskHeader = (task: Task, initialUserData?: UserData) =>
  render(
    <WithStatefulUserData initialUserData={initialUserData}>
      <TaskHeader task={task} />
    </WithStatefulUserData>
  );

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

  it("updates task status when progress is selected", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
    };

    renderTaskHeader(generateTask({ id: taskId }), generateUserData({ taskProgress }));

    fireEvent.click(screen.getAllByText("Not started")[0]);
    fireEvent.click(screen.getByText("In progress"));
    expect(screen.getAllByText("In progress")[0]).toBeVisible();
    expect(currentUserData().taskProgress).toEqual({
      "some-id": "COMPLETED",
      [taskId]: "IN_PROGRESS",
    });
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

  const changeTaskNotStartedToCompleted = (): void => {
    fireEvent.click(screen.getAllByText("Not started")[0]);
    fireEvent.click(screen.getByText("Completed"));
    expect(screen.getAllByText("Completed")[0]).toBeVisible();
  };
});

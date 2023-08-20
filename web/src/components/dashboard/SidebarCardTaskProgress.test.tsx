import { SidebarCardTaskProgress } from "@/components/dashboard/SidebarCardTaskProgress";
import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import { generateRoadmap, generateSidebarCardContent, generateStep, generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateBusiness } from "@businessnjgovnavigator/shared";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const Config = getMergedConfig();

describe("<SidebarCardTaskProgress />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
    useMockRoadmap({});
  });

  it("inserts users percentDone into header text", () => {
    const card = generateSidebarCardContent({
      header: "Hey kid, you're ${percentDone} done",
    });

    useMockRoadmap(
      generateRoadmap({
        steps: [generateStep({ stepNumber: 1 }), generateStep({ stepNumber: 2 })],
        tasks: [
          generateTask({ id: "task1", stepNumber: 1 }),
          generateTask({ id: "task2", stepNumber: 1 }),
          generateTask({ id: "task3", stepNumber: 2 }),
        ],
      }),
    );

    useMockBusiness(
      generateBusiness({
        taskProgress: {
          task1: "COMPLETED",
          task2: "IN_PROGRESS",
          "some-other-task": "NOT_STARTED",
        },
      }),
    );
    render(<SidebarCardTaskProgress card={card} />);
    expect(screen.getByText("Hey kid, you're 33% done")).toBeInTheDocument();
  });

  describe("counting incomplete required and optional tasks in card body", () => {
    beforeEach(() => {
      useMockRoadmap(
        generateRoadmap({
          steps: [generateStep({ stepNumber: 1 }), generateStep({ stepNumber: 2 })],
          tasks: [
            generateTask({ required: true, id: "requiredTask1", stepNumber: 1 }),
            generateTask({ required: false, id: "optionalTask1", stepNumber: 1 }),
            generateTask({ required: true, id: "requiredTask2", stepNumber: 2 }),
            generateTask({ required: false, id: "optionalTask2", stepNumber: 2 }),
          ],
        }),
      );
    });

    it("uses plural phrase when multiple optional tasks are incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberOptionalTasks} left",
      });

      useMockBusiness(
        generateBusiness({
          taskProgress: {
            optionalTask1: "IN_PROGRESS",
            optionalTask2: "NOT_STARTED",
          },
        }),
      );

      render(<SidebarCardTaskProgress card={card} />);
      const expectedPhrase = templateEval(Config.taskProgressCard.optionalTasksPlural, { numTasks: "2" });
      expect(screen.getByText(`You have ${expectedPhrase} left`)).toBeInTheDocument();
    });

    it("uses singular phrase when a single optional task is incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberOptionalTasks} left",
      });

      useMockBusiness(
        generateBusiness({
          taskProgress: {
            optionalTask1: "COMPLETED",
            optionalTask2: "NOT_STARTED",
          },
        }),
      );

      render(<SidebarCardTaskProgress card={card} />);

      const expectedPhrase = templateEval(Config.taskProgressCard.optionalTasksSingular, { numTasks: "1" });
      expect(screen.getByText(`You have ${expectedPhrase} left`)).toBeInTheDocument();
    });

    it("uses plural phrase when multiple required tasks are incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberRequiredTasks} left",
      });

      useMockBusiness(
        generateBusiness({
          taskProgress: {
            requiredTask1: "IN_PROGRESS",
            requiredTask2: "NOT_STARTED",
          },
        }),
      );

      render(<SidebarCardTaskProgress card={card} />);

      const expectedPhrase = templateEval(Config.taskProgressCard.requiredTasksPlural, { numTasks: "2" });
      expect(screen.getByText(`You have ${expectedPhrase} left`)).toBeInTheDocument();
    });

    it("uses singular phrase when a single required task is incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberRequiredTasks} left",
      });

      useMockBusiness(
        generateBusiness({
          taskProgress: {
            requiredTask1: "COMPLETED",
            requiredTask2: "NOT_STARTED",
          },
        }),
      );

      render(<SidebarCardTaskProgress card={card} />);

      const expectedPhrase = templateEval(Config.taskProgressCard.requiredTasksSingular, { numTasks: "1" });
      expect(screen.getByText(`You have ${expectedPhrase} left`)).toBeInTheDocument();
    });

    it("uses plural phrases when zero tasks are incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberOptionalTasks} and ${numberRequiredTasks} left",
      });

      useMockBusiness(
        generateBusiness({
          taskProgress: {
            optionalTask1: "COMPLETED",
            optionalTask2: "COMPLETED",
            requiredTask1: "COMPLETED",
            requiredTask2: "COMPLETED",
          },
        }),
      );

      render(<SidebarCardTaskProgress card={card} />);
      const requiredExpectedPhrase = templateEval(Config.taskProgressCard.requiredTasksPlural, {
        numTasks: "0",
      });
      const optionalExpectedPhrase = templateEval(Config.taskProgressCard.optionalTasksPlural, {
        numTasks: "0",
      });

      expect(
        screen.getByText(`You have ${optionalExpectedPhrase} and ${requiredExpectedPhrase} left`),
      ).toBeInTheDocument();
    });
  });

  it("displays progressbar", () => {
    render(<SidebarCardTaskProgress card={generateSidebarCardContent({})} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows completed header if all tasks are completed", () => {
    const card = generateSidebarCardContent({
      header: "Hey kid, you're ${percentDone} done",
      completedHeader: "All done!",
    });

    useMockBusiness(generateBusiness({ taskProgress: { Task1: "COMPLETED" } }));
    useMockRoadmap(
      generateRoadmap({
        steps: [generateStep({ stepNumber: 1 })],
        tasks: [generateTask({ stepNumber: 1, id: "Task1" })],
      }),
    );
    render(<SidebarCardTaskProgress card={card} />);
    expect(screen.getByText("All done!")).toBeInTheDocument();
    expect(screen.queryByText("Hey kid, you're 100% done")).not.toBeInTheDocument();
  });

  it("displays not started header if no tasks are completed", () => {
    const card = generateSidebarCardContent({
      header: "Hey kid, you're ${percentDone} done",
      notStartedHeader: "Get to work",
    });
    useMockBusiness(generateBusiness({ taskProgress: {} }));
    useMockRoadmap(
      generateRoadmap({
        steps: [generateStep({ stepNumber: 1 })],
        tasks: [generateTask({ stepNumber: 1, id: "Task1" })],
      }),
    );
    render(<SidebarCardTaskProgress card={card} />);
    expect(screen.getByText("Get to work")).toBeInTheDocument();
    expect(screen.queryByText("Hey kid, you're 0% done")).not.toBeInTheDocument();
  });
});

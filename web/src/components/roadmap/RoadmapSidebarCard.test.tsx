import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";
import {
  generateRoadmap,
  generateSidebarCardContent,
  generateStep,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { render, screen } from "@testing-library/react";
import { RoadmapSidebarCard } from "./RoadmapSidebarCard";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const Config = getMergedConfig();

describe("<RoadmapSidebarCard />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
  });

  it("inserts users percentDone into header text", () => {
    const card = generateSidebarCardContent({
      header: "Hey kid, you're ${percentDone} done",
    });

    useMockRoadmap(
      generateRoadmap({
        steps: [
          generateStep({
            tasks: [generateTask({ id: "task1" }), generateTask({ id: "task2" })],
          }),
          generateStep({
            tasks: [generateTask({ id: "task3" })],
          }),
        ],
      })
    );

    const fakeUserData = generateUserData({
      taskProgress: {
        task1: "COMPLETED",
        task2: "IN_PROGRESS",
        "some-other-task": "NOT_STARTED",
      },
    });
    useMockUserData(fakeUserData);

    render(<RoadmapSidebarCard card={card} />);

    expect(screen.getByText("Hey kid, you're 33% done")).toBeInTheDocument();
  });

  describe("counting incomplete required and optional tasks in card body", () => {
    beforeEach(() => {
      useMockRoadmap(
        generateRoadmap({
          steps: [
            generateStep({
              tasks: [
                generateTask({
                  required: true,
                  id: "requiredTask1",
                }),
                generateTask({
                  required: false,
                  id: "optionalTask1",
                }),
              ],
            }),
            generateStep({
              tasks: [
                generateTask({
                  required: true,
                  id: "requiredTask2",
                }),
                generateTask({
                  required: false,
                  id: "optionalTask2",
                }),
              ],
            }),
          ],
        })
      );
    });

    it("uses plural phrase when multiple optional tasks are incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberOptionalTasks} left",
      });

      useMockUserData(
        generateUserData({
          taskProgress: {
            optionalTask1: "IN_PROGRESS",
            optionalTask2: "NOT_STARTED",
          },
        })
      );

      render(<RoadmapSidebarCard card={card} />);
      const expectedPhrase = templateEval(Config.taskProgressCard.optionalTasksPlural, { numTasks: "2" });
      expect(screen.getByText(`You have ${expectedPhrase} left`)).toBeInTheDocument();
    });

    it("uses singular phrase when a single optional task is incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberOptionalTasks} left",
      });

      useMockUserData(
        generateUserData({
          taskProgress: {
            optionalTask1: "COMPLETED",
            optionalTask2: "NOT_STARTED",
          },
        })
      );

      render(<RoadmapSidebarCard card={card} />);

      const expectedPhrase = templateEval(Config.taskProgressCard.optionalTasksSingular, { numTasks: "1" });
      expect(screen.getByText(`You have ${expectedPhrase} left`)).toBeInTheDocument();
    });

    it("uses plural phrase when multiple required tasks are incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberRequiredTasks} left",
      });

      useMockUserData(
        generateUserData({
          taskProgress: {
            requiredTask1: "IN_PROGRESS",
            requiredTask2: "NOT_STARTED",
          },
        })
      );

      render(<RoadmapSidebarCard card={card} />);

      const expectedPhrase = templateEval(Config.taskProgressCard.requiredTasksPlural, { numTasks: "2" });
      expect(screen.getByText(`You have ${expectedPhrase} left`)).toBeInTheDocument();
    });

    it("uses singular phrase when a single required task is incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberRequiredTasks} left",
      });

      useMockUserData(
        generateUserData({
          taskProgress: {
            requiredTask1: "COMPLETED",
            requiredTask2: "NOT_STARTED",
          },
        })
      );

      render(<RoadmapSidebarCard card={card} />);

      const expectedPhrase = templateEval(Config.taskProgressCard.requiredTasksSingular, { numTasks: "1" });
      expect(screen.getByText(`You have ${expectedPhrase} left`)).toBeInTheDocument();
    });

    it("uses plural phrases when zero tasks are incomplete", () => {
      const card = generateSidebarCardContent({
        contentMd: "You have ${numberOptionalTasks} and ${numberRequiredTasks} left",
      });

      useMockUserData(
        generateUserData({
          taskProgress: {
            optionalTask1: "COMPLETED",
            optionalTask2: "COMPLETED",
            requiredTask1: "COMPLETED",
            requiredTask2: "COMPLETED",
          },
        })
      );

      render(<RoadmapSidebarCard card={card} />);
      const requiredExpectedPhrase = templateEval(Config.taskProgressCard.requiredTasksPlural, {
        numTasks: "0",
      });
      const optionalExpectedPhrase = templateEval(Config.taskProgressCard.optionalTasksPlural, {
        numTasks: "0",
      });

      expect(
        screen.getByText(`You have ${optionalExpectedPhrase} and ${requiredExpectedPhrase} left`)
      ).toBeInTheDocument();
    });
  });

  it("displays progressbar when card id is task-progress", () => {
    const card = generateSidebarCardContent({
      id: "task-progress",
    });
    render(<RoadmapSidebarCard card={card} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("doesn't display progressbar when card id is not task-progress", () => {
    const card = generateSidebarCardContent({
      id: "welcome",
    });
    render(<RoadmapSidebarCard card={card} />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("filters tasks based on current roadmap", () => {
    const card = generateSidebarCardContent({
      header: "Hey kid, you're ${percentDone} done",
      id: "task-progress",
    });
    useMockUserData(
      generateUserData({
        taskProgress: {
          Task1: "COMPLETED",
          Task2: "COMPLETED",
          Task3: "COMPLETED",
          Task4: "COMPLETED",
        },
      })
    );
    useMockRoadmap(
      generateRoadmap({
        steps: [
          generateStep({
            tasks: [
              generateTask({
                required: true,
                id: "Task1",
              }),
              generateTask({
                required: false,
                id: "Task2",
              }),
            ],
          }),
        ],
      })
    );
    render(<RoadmapSidebarCard card={card} />);
    expect(screen.getByText("Hey kid, you're 100% done")).toBeInTheDocument();
  });
});

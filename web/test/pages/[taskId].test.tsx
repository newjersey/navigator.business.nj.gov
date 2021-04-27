import { fireEvent, render, RenderResult } from "@testing-library/react";
import TaskPage from "../../pages/tasks/[taskId]";
import { useMediaQuery } from "@material-ui/core";
import * as useRoadmapModule from "../../lib/data-hooks/useRoadmap";
import * as useUserDataModule from "../../lib/data-hooks/useUserData";
import { generateRoadmap, generateStep, generateTask, generateUserData } from "../factories";
import { generateUseUserDataResponse } from "../helpers";
import { Task, TaskProgress } from "../../lib/types/types";

jest.mock("../../lib/data-hooks/useRoadmap", () => ({
  useRoadmap: jest.fn(),
}));
const mockUseRoadmap = (useRoadmapModule as jest.Mocked<typeof useRoadmapModule>).useRoadmap;

jest.mock("../../lib/data-hooks/useUserData", () => ({
  useUserData: jest.fn(),
}));
const mockUseUserData = (useUserDataModule as jest.Mocked<typeof useUserDataModule>).useUserData;

/* eslint-disable @typescript-eslint/explicit-function-return-type */
function mockMaterialUI() {
  const original = jest.requireActual("@material-ui/core");
  return {
    ...original,
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@material-ui/core", () => mockMaterialUI());

const setLargeScreen = (): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => true);
};

describe("task page", () => {
  let subject: RenderResult;

  beforeEach(() => {
    setLargeScreen();
    mockUseRoadmap.mockReturnValue({ roadmap: undefined });
    mockUseUserData.mockReturnValue(generateUseUserDataResponse({}));
  });

  it("shows the task details", () => {
    const task = generateTask({
      name: "complete a tax form",
      contentMd:
        "## fill out your tax form\n" +
        "\n" +
        "it has to get done\n" +
        "\n" +
        "||\n" +
        "|---|\n" +
        "| destination: city clerk |\n",
      callToActionLink: "www.example.com",
      callToActionText: "Submit The Form Here",
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.getByText("complete a tax form")).toBeInTheDocument();
    expect(subject.getByText("fill out your tax form")).toBeInTheDocument();
    expect(subject.getByText("it has to get done")).toBeInTheDocument();
    expect(subject.getByText("destination: city clerk")).toBeInTheDocument();
    expect(subject.getByText("Submit The Form Here")).toBeInTheDocument();

    expect(subject.queryByText("Back to Roadmap", { exact: false })).toBeInTheDocument();
  });

  it("does not show button if no link available", () => {
    const task = generateTask({
      callToActionText: "Submit it Here",
      callToActionLink: "",
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.queryByText("Submit it Here")).not.toBeInTheDocument();
  });

  it("shows default text if call to action has link but no text", () => {
    const task = generateTask({
      callToActionText: "",
      callToActionLink: "www.example.com",
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.getByText("Start Application")).toBeInTheDocument();
  });

  it("shows updated call-to-action if different from static content", () => {
    const task = generateTask({
      id: "123",
      contentMd: "original description",
      callToActionText: "original call to action",
    });

    mockTaskInRoadmap(
      generateTask({
        id: "123",
        contentMd: "a whole brand new description",
        callToActionText: "a whole brand new call to action",
      })
    );

    subject = render(<TaskPage task={task} />);
    expect(subject.queryByText("original description")).not.toBeInTheDocument();
    expect(subject.queryByText("a whole brand new description")).toBeInTheDocument();

    expect(subject.queryByText("original call to action")).not.toBeInTheDocument();
    expect(subject.queryByText("a whole brand new call to action")).toBeInTheDocument();
  });

  it("displays Not Started status when user data does not contain status", () => {
    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({ userData: generateUserData({ taskProgress: {} }) })
    );
    subject = render(<TaskPage task={generateTask({})} />);

    expect(subject.getAllByText("Not started")[0]).toBeVisible();
  });

  it("displays task status from user data", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
      [taskId]: "IN_PROGRESS",
    };
    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({ userData: generateUserData({ taskProgress }) })
    );
    subject = render(<TaskPage task={generateTask({ id: taskId })} />);

    expect(subject.getAllByText("In-progress")[0]).toBeVisible();
  });

  it("updates task status when progress is selected", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
    };
    const update = jest.fn();
    const userData = generateUserData({ taskProgress });
    mockUseUserData.mockReturnValue(generateUseUserDataResponse({ userData, update }));
    subject = render(<TaskPage task={generateTask({ id: taskId })} />);

    fireEvent.click(subject.getAllByText("Not started")[0]);
    fireEvent.click(subject.getByText("In-progress"));
    expect(subject.getAllByText("In-progress")[0]).toBeVisible();
    expect(update).toHaveBeenCalledWith({
      ...userData,
      taskProgress: {
        "some-id": "COMPLETED",
        [taskId]: "IN_PROGRESS",
      },
    });
  });

  const mockTaskInRoadmap = (task: Task): void => {
    mockUseRoadmap.mockReturnValue({
      roadmap: generateRoadmap({
        steps: [
          generateStep({
            tasks: [task],
          }),
        ],
      }),
    });
  };
});

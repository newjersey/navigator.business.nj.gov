import { fireEvent, render, RenderResult } from "@testing-library/react";
import { useMediaQuery } from "@material-ui/core";
import * as materialUi from "@material-ui/core";
import TaskPage from "@/pages/tasks/[taskId]";
import { TaskProgress } from "@/lib/types/types";
import { generateTask, generateUserData } from "@/test/factories";
import { mockUpdate, useMockUserData } from "@/test/mock/mockUseUserData";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@material-ui/core"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@material-ui/core", () => mockMaterialUI());
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const setLargeScreen = (): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => true);
};

describe("task page", () => {
  let subject: RenderResult;

  beforeEach(() => {
    setLargeScreen();
    useMockRoadmap({});
    useMockUserData({});
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

    useMockRoadmapTask({
      id: "123",
      contentMd: "a whole brand new description",
      callToActionText: "a whole brand new call to action",
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.queryByText("original description")).not.toBeInTheDocument();
    expect(subject.queryByText("a whole brand new description")).toBeInTheDocument();

    expect(subject.queryByText("original call to action")).not.toBeInTheDocument();
    expect(subject.queryByText("a whole brand new call to action")).toBeInTheDocument();
  });

  it("displays Not Started status when user data does not contain status", () => {
    useMockUserData({ taskProgress: {} });
    subject = render(<TaskPage task={generateTask({})} />);

    expect(subject.getAllByText("Not started")[0]).toBeVisible();
  });

  it("displays task status from user data", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
      [taskId]: "IN_PROGRESS",
    };
    useMockUserData({ taskProgress });
    subject = render(<TaskPage task={generateTask({ id: taskId })} />);

    expect(subject.getAllByText("In-progress")[0]).toBeVisible();
  });

  it("updates task status when progress is selected", () => {
    const taskId = "123";
    const taskProgress: Record<string, TaskProgress> = {
      "some-id": "COMPLETED",
    };

    const userData = generateUserData({ taskProgress });
    useMockUserData(userData);
    subject = render(<TaskPage task={generateTask({ id: taskId })} />);

    fireEvent.click(subject.getAllByText("Not started")[0]);
    fireEvent.click(subject.getByText("In-progress"));
    expect(subject.getAllByText("In-progress")[0]).toBeVisible();
    expect(mockUpdate).toHaveBeenCalledWith({
      ...userData,
      taskProgress: {
        "some-id": "COMPLETED",
        [taskId]: "IN_PROGRESS",
      },
    });
  });
});

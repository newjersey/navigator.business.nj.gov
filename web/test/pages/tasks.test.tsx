import { render, RenderResult } from "@testing-library/react";
import TaskPage from "../../pages/tasks/[taskId]";
import { useMediaQuery } from "@material-ui/core";

import * as useRoadmapModule from "../../lib/data/useRoadmap";
import { generateRoadmap, generateStep, generateTask } from "../factories";

jest.mock("../../lib/data/useRoadmap", () => ({
  useRoadmap: jest.fn(),
}));
const mockUseRoadmap = (useRoadmapModule as jest.Mocked<typeof useRoadmapModule>).useRoadmap;

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
  });

  it("shows the task details", () => {
    const task = generateTask({
      name: "complete a tax form",
      description: "fill out your tax form",
      destination: {
        name: "city clerk",
        link: "www.example.com",
      },
      to_complete_must_have: ["tax number", "patience"],
      after_completing_will_have: ["paid your taxes", "sense of satisfaction"],
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.getByText("complete a tax form")).toBeInTheDocument();
    expect(subject.getByText("fill out your tax form")).toBeInTheDocument();
    expect(subject.getByText("tax number")).toBeInTheDocument();
    expect(subject.getByText("patience")).toBeInTheDocument();
    expect(subject.getByText("paid your taxes")).toBeInTheDocument();
    expect(subject.getByText("sense of satisfaction")).toBeInTheDocument();
    expect(subject.getByText("city clerk")).toBeInTheDocument();
    expect(subject.getByText("Start Application")).toBeInTheDocument();

    expect(subject.queryByText("Back to Roadmap", { exact: false })).toBeInTheDocument();
  });

  it("does not show button if no link available", () => {
    const task = generateTask({
      destination: {
        name: "city clerk",
        link: "",
      },
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.queryByText("Start Application")).not.toBeInTheDocument();
  });

  it("does not show destination if no destination name available", () => {
    const task = generateTask({
      destination: {
        name: "",
        link: "whatever",
      },
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.queryByText("Destination:", { exact: false })).not.toBeInTheDocument();
  });

  it("does not show dependencies if not available", () => {
    const task = generateTask({
      to_complete_must_have: [],
      after_completing_will_have: [],
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.queryByText("To complete this step, you must have:")).not.toBeInTheDocument();
    expect(subject.queryByText("After you complete this step, you will have:")).not.toBeInTheDocument();
  });

  it("shows updated text if different from static content", () => {
    const task = generateTask({
      id: "123",
      description: "original task description",
    });

    mockUseRoadmap.mockReturnValue({
      roadmap: generateRoadmap({
        steps: [
          generateStep({
            tasks: [
              generateTask({
                id: "123",
                description: "a whole brand new description",
              }),
            ],
          }),
        ],
      }),
    });

    subject = render(<TaskPage task={task} />);
    expect(subject.queryByText("original task description")).not.toBeInTheDocument();
    expect(subject.queryByText("a whole brand new description")).toBeInTheDocument();
  });
});

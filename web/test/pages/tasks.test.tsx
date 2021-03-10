import { render, RenderResult } from "@testing-library/react";
import { generateTask } from "../factories";
import TaskPage from "../../pages/tasks/[taskId]";
import * as reactResponsive from "react-responsive";

jest.mock("react-responsive");
const mockMediaQuery = (reactResponsive as jest.Mocked<typeof reactResponsive>).useMediaQuery;

describe("task page", () => {
  let subject: RenderResult;
  const setLargeScreen = () => {
    mockMediaQuery.mockReturnValue(true);
  };

  beforeEach(() => {
    setLargeScreen();
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
});

import { render, RenderResult } from "@testing-library/react";
import { generateTask } from "../factories";
import TaskPage from "../../pages/tasks/[taskId]";

describe("task page", () => {
  let subject: RenderResult;

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
  });

  it("shows back to roadmap instead of back to home", () => {
    subject = render(<TaskPage task={generateTask({})} />);
    expect(subject.queryByText("Back to roadmap", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText("Back to home", { exact: false })).not.toBeInTheDocument();
  });
});

import { Task } from "./Task";
import { generateTask } from "@/test/factories";
import { render } from "@testing-library/react";

describe("<Task />", () => {
  it("links to the task page by id", () => {
    const task = generateTask({ id: "task1", name: "task 1" });
    const subject = render(<Task task={task} />);
    expect(subject.getByText("task 1").getAttribute("href")).toEqual("/tasks/task1");
  });
});

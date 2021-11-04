import React from "react";
import { Task } from "./Task";
import { generateTask } from "@/test/factories";
import { render } from "@testing-library/react";

describe("<Task />", () => {
  it("links to the task page by url slug", () => {
    const task = generateTask({ urlSlug: "url-slug-1", name: "task 1" });
    const subject = render(<Task task={task} />);
    expect(subject.getByText("task 1").getAttribute("href")).toEqual("/tasks/url-slug-1");
  });
});

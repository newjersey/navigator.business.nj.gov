import { generateTask } from "@/test/factories";
import { createTheme, ThemeProvider } from "@mui/material";
import { render } from "@testing-library/react";
import React from "react";
import { Task } from "./Task";

describe("<Task />", () => {
  it("links to the task page by url slug", () => {
    const task = generateTask({ urlSlug: "url-slug-1", name: "task 1" });
    const subject = render(
      <ThemeProvider theme={createTheme()}>
        <Task task={task} />
      </ThemeProvider>
    );
    expect(subject.getByText("task 1").getAttribute("href")).toEqual("/tasks/url-slug-1");
  });
});

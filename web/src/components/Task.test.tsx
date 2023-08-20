import { Task } from "@/components/Task";
import { generateTask } from "@/test/factories";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";

describe("<Task />", () => {
  it("links to the task page by url slug", () => {
    const task = generateTask({ urlSlug: "url-slug-1", name: "task 1" });
    render(
      <ThemeProvider theme={createTheme()}>
        <Task task={task} />
      </ThemeProvider>,
    );
    expect(screen.getByText("task 1")).toHaveAttribute("href", "/tasks/url-slug-1");
  });

  it("renders required content when task is required", () => {
    const task = generateTask({ urlSlug: "url-slug-1", name: "task 1", required: true });

    render(
      <ThemeProvider theme={createTheme()}>
        <Task task={task} />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("required task")).toBeInTheDocument();
  });
});

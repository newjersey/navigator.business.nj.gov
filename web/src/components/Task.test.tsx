import { Task } from "@/components/Task";
import { generateTask } from "@/test/factories";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { render, screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

import { useMockBusiness } from "@/test/mock/mockUseUserData";

describe("<Task />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
    (useMediaQuery as jest.Mock).mockReturnValue(true); // simulate tablet and up
  });

  it("links to the task page by url slug", () => {
    const task = generateTask({ urlSlug: "url-slug-1", name: "task 1" });
    render(
      <ThemeProvider theme={createTheme()}>
        <Task task={task} />
      </ThemeProvider>,
    );
    expect(screen.getByText("task 1")).toHaveAttribute("href", "/tasks/url-slug-1");
  });

  it("renders required label when task is required and showRequiredLabel is true", () => {
    const task = generateTask({ urlSlug: "url-slug-1", name: "task 1", required: true });

    render(
      <ThemeProvider theme={createTheme()}>
        <Task task={task} showRequiredLabel />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("required task")).toBeInTheDocument();
  });

  it("does not render required label when showRequiredLabel is not passed", () => {
    const task = generateTask({ urlSlug: "url-slug-1", name: "task 1", required: true });

    render(
      <ThemeProvider theme={createTheme()}>
        <Task task={task} />
      </ThemeProvider>,
    );

    expect(screen.queryByTestId("required task")).not.toBeInTheDocument();
  });
});

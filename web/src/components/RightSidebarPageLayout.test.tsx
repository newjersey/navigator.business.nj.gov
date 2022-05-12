import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { render } from "@testing-library/react";
import React from "react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());

describe("<RightSidebarPageLayout />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useMediaQuery as jest.Mock).mockImplementation(() => true); // set large screen
  });

  it("renders with default color", () => {
    const subject = render(
      <RightSidebarPageLayout
        mainContent={<div>Left Side</div>}
        sidebarContent={<div>Right Side</div>}
        color="default"
      />
    );

    expect(subject.getByTestId("rightSidebarPageLayout")).toHaveClass("grayRightGutter");
    expect(subject.getByTestId("rightSidebarPageLayout")).not.toHaveClass("blueRightGutter");
  });

  it("renders with blue color", () => {
    const subject = render(
      <RightSidebarPageLayout
        mainContent={<div>Left Side</div>}
        sidebarContent={<div>Right Side</div>}
        color="blue"
      />
    );

    expect(subject.getByTestId("rightSidebarPageLayout")).not.toHaveClass("grayRightGutter");
    expect(subject.getByTestId("rightSidebarPageLayout")).toHaveClass("blueRightGutter");
  });
});

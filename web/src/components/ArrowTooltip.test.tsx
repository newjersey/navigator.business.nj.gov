import { ArrowTooltip } from "@/components/ArrowTooltip";
import { HelpOutline } from "@mui/icons-material";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const isMobile = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => {
    return value;
  });
};

const testString = "test_string";

const renderToolTip = (): void => {
  render(
    <ThemeProvider theme={createTheme()}>
      <ArrowTooltip title={testString}>
        <div className="fdr fac font-body-lg text-green" data-testid="tooltip">
          <HelpOutline />
        </div>
      </ArrowTooltip>
    </ThemeProvider>
  );
};

describe("<ArrowTooltip />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows onClick on mobile", async () => {
    isMobile(true);

    renderToolTip();

    expect(screen.queryByText(testString)).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("tooltip"));
    await waitFor(() => {
      expect(screen.getByText(testString)).toBeInTheDocument();
    });
  });

  it("shows on hover on desktop", async () => {
    isMobile(false);
    renderToolTip();

    expect(screen.queryByText(testString)).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId("tooltip"));
    await waitFor(() => {
      expect(screen.getByText(testString)).toBeInTheDocument();
    });
  });
});

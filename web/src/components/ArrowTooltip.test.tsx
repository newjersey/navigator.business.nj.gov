import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Icon } from "@/components/njwds/Icon";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";

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
          <Icon iconName="help_outline" />
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
    const user = userEvent.setup();
    renderToolTip();

    expect(screen.queryByText(testString)).not.toBeInTheDocument();

    await user.click(screen.getByTestId("tooltip"));
    await waitFor(() => {
      expect(screen.getByText(testString)).toBeInTheDocument();
    });
  });

  it("shows on hover on desktop", async () => {
    isMobile(false);
    const user = userEvent.setup();
    renderToolTip();

    expect(screen.queryByText(testString)).not.toBeInTheDocument();

    await user.hover(screen.getByTestId("tooltip"));
    await waitFor(() => {
      expect(screen.getByText(testString)).toBeInTheDocument();
    });
  });
});

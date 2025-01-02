import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Icon } from "@/components/njwds/Icon";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<typeof import("@mui/material")>("@mui/material");
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

const isMobile = (value: boolean): void => {
  (useMediaQuery as vi.Mock).mockImplementation(() => {
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
    vi.resetAllMocks();
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

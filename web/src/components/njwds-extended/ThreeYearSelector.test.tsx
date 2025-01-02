import { ThreeYearSelector } from "@/components/njwds-extended/ThreeYearSelector";
import * as shared from "@businessnjgovnavigator/shared";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dayjs } from "dayjs";

function mockShared(): typeof shared {
  return {
    ...vi.requireActual("@businessnjgovnavigator/shared"),
    getCurrentDate: (): Dayjs => {
      return parseDateWithFormat(`2024-02-15`, "YYYY-MM-DD");
    },
  };
}

vi.mock("@businessnjgovnavigator/shared", () => mockShared());

const onChange = vi.fn();

describe("<ThreeYearSelector />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("changes the year when dropdown pill is pressed", () => {
    render(<ThreeYearSelector onChange={onChange} activeYear={"2025"} years={["2024", "2025", "2026"]} />);
    fireEvent.click(screen.getByText("2025"));
    fireEvent.click(screen.getByText("2024"));
    expect(onChange).toHaveBeenCalledWith("2024");
  });

  it("changes the year when left chevron is pressed", () => {
    render(<ThreeYearSelector onChange={onChange} activeYear={"2025"} years={["2024", "2025", "2026"]} />);
    fireEvent.click(screen.getByTestId("year-selector-left"));
    expect(onChange).toHaveBeenCalledWith("2024");
  });

  it("changes the year when right chevron is pressed", () => {
    render(<ThreeYearSelector onChange={onChange} activeYear={"2025"} years={["2024", "2025", "2026"]} />);
    fireEvent.click(screen.getByTestId("year-selector-right"));
    expect(onChange).toHaveBeenCalledWith("2026");
  });

  it("displays the left and right chevron when at the center of the year array", () => {
    render(<ThreeYearSelector onChange={onChange} activeYear={"2025"} years={["2024", "2025", "2026"]} />);
    expect(screen.getByTestId("year-selector-left")).not.toHaveClass("visibility-hidden");
    expect(screen.getByTestId("year-selector-left")).toBeEnabled();
    expect(screen.getByTestId("year-selector-right")).not.toHaveClass("visibility-hidden");
    expect(screen.getByTestId("year-selector-right")).toBeEnabled();
  });

  it("hides the left chevron when at the beginning of the year array", () => {
    render(<ThreeYearSelector onChange={onChange} activeYear={"2024"} years={["2024", "2025", "2026"]} />);
    expect(screen.getByTestId("year-selector-left")).toHaveClass("visibility-hidden");
    expect(screen.getByTestId("year-selector-left")).toBeDisabled();
  });

  it("hides the right chevron when at the end of the year array", () => {
    render(<ThreeYearSelector onChange={onChange} activeYear={"2026"} years={["2024", "2025", "2026"]} />);
    expect(screen.getByTestId("year-selector-right")).toHaveClass("visibility-hidden");
    expect(screen.getByTestId("year-selector-right")).toBeDisabled();
  });
});

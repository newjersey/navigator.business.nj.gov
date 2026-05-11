import { ProgressBar } from "@/components/ProgressBar";
import { render, screen } from "@testing-library/react";

describe("<ProgressBar />", () => {
  it("renders with role progressbar", () => {
    render(<ProgressBar label="Profile completion" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders with the given label", () => {
    render(<ProgressBar label="Profile completion" />);
    expect(screen.getByRole("progressbar", { name: "Profile completion" })).toBeInTheDocument();
  });

  it("sets aria-valuenow to the percentage", () => {
    render(<ProgressBar label="Profile completion" percentage={42} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
  });

  it("sets aria-valuemax to 100", () => {
    render(<ProgressBar label="Profile completion" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "100");
  });

  it("defaults aria-valuenow to 0 when no percentage given", () => {
    render(<ProgressBar label="Profile completion" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });
});

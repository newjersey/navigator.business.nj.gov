import { LearnStepIndicator } from "@/components/roadmap/LearnStepIndicator";
import { render, screen } from "@testing-library/react";

describe("LearnStepIndicator", () => {
  it("renders the accessible step number", () => {
    render(<LearnStepIndicator stepNumber={2} active={false} />);

    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("marks an active step", () => {
    const { rerender } = render(<LearnStepIndicator stepNumber={2} active={true} />);

    expect(screen.getByTestId("learn-step-indicator")).toHaveClass("learn-step-indicator--active");

    rerender(<LearnStepIndicator stepNumber={2} active={false} />);

    expect(screen.getByTestId("learn-step-indicator")).not.toHaveClass(
      "learn-step-indicator--active",
    );
  });
});

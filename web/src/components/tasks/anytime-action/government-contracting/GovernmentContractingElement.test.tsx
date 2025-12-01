import { GovernmentContractingElement } from "@/components/tasks/anytime-action/government-contracting/GovernmentContractingElement";
import { generateAnytimeActionTask } from "@/test/factories";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("AnytimeActionGovernmentContractingElement", () => {
  const renderComponent = (): void => {
    const task = generateAnytimeActionTask({ filename: "government-contracting" });
    render(<GovernmentContractingElement anytimeActionHeaderText={task.name} />);
  };

  it("renders first tab", () => {
    renderComponent();
    const firstTab = screen.getByRole("tab", {
      name: new RegExp(Config.governmentContracting.stepOneStepperLabel, "i"),
    });
    expect(firstTab).toHaveAttribute("aria-selected", "true");
  });

  it("renders second tab", () => {
    renderComponent();
    const secondTab = screen.getByRole("tab", {
      name: new RegExp(Config.governmentContracting.stepTwoStepperLabel, "i"),
    });
    fireEvent.click(secondTab);
    expect(secondTab).toHaveAttribute("aria-selected", "true");
  });

  it("renders third tab", () => {
    renderComponent();
    const thirdTab = screen.getByRole("tab", {
      name: new RegExp(Config.governmentContracting.stepThreeStepperLabel, "i"),
    });
    fireEvent.click(thirdTab);
    expect(thirdTab).toHaveAttribute("aria-selected", "true");
  });

  it("renders fourth tab", () => {
    renderComponent();
    const fourthTab = screen.getByRole("tab", {
      name: new RegExp(Config.governmentContracting.stepThreeStepperLabel, "i"),
    });
    fireEvent.click(fourthTab);
    expect(fourthTab).toHaveAttribute("aria-selected", "true");
  });
});

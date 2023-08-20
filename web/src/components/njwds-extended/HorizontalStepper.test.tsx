import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { render, screen } from "@testing-library/react";

describe("<HorizontalStepper />", () => {
  describe("step state", () => {
    it("has ERROR state when step hasError and is not currentStep", () => {
      const steps = [
        { name: "", hasError: true, isComplete: false },
        { name: "", hasError: false, isComplete: true },
      ];
      render(<HorizontalStepper steps={steps} currentStep={1} onStepClicked={(): void => {}} />);
      expect(screen.getByTestId("stepper-0").dataset.state).toEqual("ERROR");
    });

    it("has ERROR state when step hasError even if isComplete", () => {
      const steps = [
        { name: "", hasError: true, isComplete: true },
        { name: "", hasError: false, isComplete: true },
      ];
      render(<HorizontalStepper steps={steps} currentStep={1} onStepClicked={(): void => {}} />);
      expect(screen.getByTestId("stepper-0").dataset.state).toEqual("ERROR");
    });

    it("has ERROR-ACTIVE state when step hasError and is not currentStep", () => {
      const steps = [{ name: "", hasError: true, isComplete: false }];
      render(<HorizontalStepper steps={steps} currentStep={0} onStepClicked={(): void => {}} />);
      expect(screen.getByTestId("stepper-0").dataset.state).toEqual("ERROR-ACTIVE");
    });

    it("has INCOMPLETE state when step not hasError and and not isComplete and not currentStep", () => {
      const steps = [
        { name: "", hasError: false, isComplete: false },
        { name: "", hasError: false, isComplete: false },
      ];
      render(<HorizontalStepper steps={steps} currentStep={1} onStepClicked={(): void => {}} />);
      expect(screen.getByTestId("stepper-0").dataset.state).toEqual("INCOMPLETE");
    });

    it("has INCOMPLETE-ACTIVE state when step not hasError and and not isComplete and is currentStep", () => {
      const steps = [{ name: "", hasError: false, isComplete: false }];
      render(<HorizontalStepper steps={steps} currentStep={0} onStepClicked={(): void => {}} />);
      expect(screen.getByTestId("stepper-0").dataset.state).toEqual("INCOMPLETE-ACTIVE");
    });

    it("has COMPLETE state when step not hasError and and isComplete and not currentStep", () => {
      const steps = [
        { name: "", hasError: false, isComplete: true },
        { name: "", hasError: false, isComplete: false },
      ];
      render(<HorizontalStepper steps={steps} currentStep={1} onStepClicked={(): void => {}} />);
      expect(screen.getByTestId("stepper-0").dataset.state).toEqual("COMPLETE");
    });

    it("has COMPLETE-ACTIVE state when step not hasError and and isComplete and is currentStep", () => {
      const steps = [{ name: "", hasError: false, isComplete: true }];
      render(<HorizontalStepper steps={steps} currentStep={0} onStepClicked={(): void => {}} />);
      expect(screen.getByTestId("stepper-0").dataset.state).toEqual("COMPLETE-ACTIVE");
    });
  });
});

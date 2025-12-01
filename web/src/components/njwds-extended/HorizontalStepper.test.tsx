import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/compat/router";
import { NextRouter } from "next/router";
import userEvent from "@testing-library/user-event";

jest.mock("next/compat/router");

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

  describe("url query param for step indicataion", () => {
    const mockReplace = jest.fn();
    const mockRouter: Partial<NextRouter> = {
      pathname: "/test-path",
      query: { existingParam: "value" },
      replace: mockReplace,
    };

    const mockSteps = [
      { name: "Step 1", hasError: false, completed: false },
      { name: "Step 2", hasError: false, completed: false },
      { name: "Step 3", hasError: false, completed: false },
    ];

    const defaultProps = {
      steps: mockSteps,
      currentStep: 0,
      onStepClicked: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue(
        mockRouter as NextRouter,
      );
    });

    it("should update URL with step query param on initial render", () => {
      render(<HorizontalStepper {...defaultProps} />);

      expect(mockReplace).toHaveBeenCalledWith(
        {
          pathname: "/test-path",
          query: { existingParam: "value", step: 1 },
        },
        undefined,
        { shallow: true },
      );
    });

    it("should update URL when currentStep prop changes", async () => {
      const { rerender } = render(<HorizontalStepper {...defaultProps} />);

      mockReplace.mockClear();
      rerender(<HorizontalStepper {...defaultProps} currentStep={2} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          {
            pathname: "/test-path",
            query: { existingParam: "value", step: 3 },
          },
          undefined,
          { shallow: true },
        );
      });
    });

    it("should preserve existing query params when updating step", () => {
      const routerWithMultipleParams = {
        ...mockRouter,
        query: { param1: "value1", param2: "value2", param3: "value3" },
      };
      (useRouter as jest.Mock).mockReturnValue(routerWithMultipleParams);

      render(<HorizontalStepper {...defaultProps} currentStep={1} />);

      expect(mockReplace).toHaveBeenCalledWith(
        {
          pathname: "/test-path",
          query: {
            param1: "value1",
            param2: "value2",
            param3: "value3",
            step: 2,
          },
        },
        undefined,
        { shallow: true },
      );
    });

    it("should update URL when a step is clicked", async () => {
      const onStepClicked = jest.fn();
      render(<HorizontalStepper {...defaultProps} onStepClicked={onStepClicked} />);

      mockReplace.mockClear();

      const stepButton = screen.getByText("Step 2");
      await userEvent.click(stepButton);

      expect(onStepClicked).toHaveBeenCalledWith(1);
      expect(mockReplace).toHaveBeenCalledWith(
        {
          pathname: "/test-path",
          query: { existingParam: "value", step: 2 },
        },
        undefined,
        { shallow: true },
      );
    });

    it("should handle when router is undefined", () => {
      (useRouter as jest.Mock).mockReturnValue(undefined);

      expect(() => {
        render(<HorizontalStepper {...defaultProps} />);
      }).not.toThrow();

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});

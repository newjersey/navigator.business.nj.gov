import { TaxClearanceSteps } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceSteps";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { withAuth, withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { fireEvent, render, screen } from "@testing-library/react";

const mockRequireAccount = jest.fn();
const mockSetStepIndex = jest.fn();

const steps = [
  { name: "Requirements", hasError: false, isComplete: false },
  { name: "Check Eligibility", hasError: false, isComplete: false },
  { name: "Review", hasError: false, isComplete: false },
];

const renderStepper = (authState = IsAuthenticated.FALSE, currentStep = 0): void => {
  render(
    withAuth(
      withNeedsAccountContext(
        <TaxClearanceSteps
          steps={steps}
          currentStep={currentStep}
          stepIndex={mockSetStepIndex}
          saveTaxClearanceCertificateData={jest.fn()}
          setStepIndex={mockSetStepIndex}
        />,
        authState,
        { requireAccount: mockRequireAccount },
      ),
      { isAuthenticated: authState },
    ),
  );
};

describe("<TaxClearanceSteps />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls requireAccount when a step is clicked as guest (Check Eligibility)", () => {
    renderStepper(IsAuthenticated.FALSE, 0);
    fireEvent.click(screen.getByText("Check Eligibility"));
    expect(mockRequireAccount).toHaveBeenCalledWith(ROUTES.taxClearanceCertificate);
    expect(mockSetStepIndex).not.toHaveBeenCalled();
  });

  it("calls requireAccount when Review step is clicked as guest", () => {
    renderStepper(IsAuthenticated.FALSE, 0);
    fireEvent.click(screen.getByText("Review"));
    expect(mockRequireAccount).toHaveBeenCalledWith(ROUTES.taxClearanceCertificate);
    expect(mockSetStepIndex).not.toHaveBeenCalled();
  });

  it("changes step when a step is clicked as authenticated user (Check Eligibility)", () => {
    renderStepper(IsAuthenticated.TRUE, 0);
    fireEvent.click(screen.getByText("Check Eligibility"));
    expect(mockRequireAccount).not.toHaveBeenCalled();
    expect(mockSetStepIndex).toHaveBeenCalledWith(1);
  });

  it("changes step when Review step is clicked as authenticated user", () => {
    renderStepper(IsAuthenticated.TRUE, 0);
    fireEvent.click(screen.getByText("Review"));
    expect(mockRequireAccount).not.toHaveBeenCalled();
    expect(mockSetStepIndex).toHaveBeenCalledWith(2);
  });
});

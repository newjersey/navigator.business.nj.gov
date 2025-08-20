import { CigaretteLicenseAlert } from "@/components/tasks/cigarette-license/CigaretteLicenseAlert";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubmissionError } from "@businessnjgovnavigator/shared/cigaretteLicense";

describe("CigaretteLicenseAlert", () => {
  const Config = getMergedConfig();
  const mockSetStepIndex = jest.fn();

  const defaultProps = {
    fieldErrors: [],
    submissionError: undefined,
    setStepIndex: mockSetStepIndex,
  };

  it("renders null when no errors", () => {
    render(<CigaretteLicenseAlert {...defaultProps} />);
    const alertBox = screen.queryByRole("alert");
    expect(alertBox).not.toBeInTheDocument();
  });

  it("renders alert with field errors", () => {
    const props = {
      ...defaultProps,
      fieldErrors: ["businessName", "contactEmail"],
    };

    render(<CigaretteLicenseAlert {...props} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(Config.cigaretteLicenseShared.alertFieldNames.businessName),
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.cigaretteLicenseShared.alertFieldNames.contactEmail),
    ).toBeInTheDocument();
  });

  it("renders alert with payment error only", () => {
    const submissionError: SubmissionError = "PAYMENT";
    const props = {
      ...defaultProps,
      submissionError,
    };

    render(<CigaretteLicenseAlert {...props} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    // getByTestId needed - markdown content renders across multiple lines
    expect(screen.getByTestId("cigarette-license-payment-error")).toBeInTheDocument();
  });

  it("renders alert with unavailable error only", () => {
    const submissionError: SubmissionError = "UNAVAILABLE";
    const props = {
      ...defaultProps,
      submissionError,
    };

    render(<CigaretteLicenseAlert {...props} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    // getByTestId needed - markdown content renders across multiple lines
    expect(screen.getByTestId("cigarette-license-unavailable-error")).toBeInTheDocument();
  });

  it("renders alert with both field errors and response error", () => {
    const submissionError: SubmissionError = "PAYMENT";
    const props = {
      ...defaultProps,
      fieldErrors: ["businessName"],
      submissionError,
    };

    render(<CigaretteLicenseAlert {...props} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    // getByTestId needed - markdown content renders across multiple lines
    expect(screen.getByTestId("cigarette-license-error-alert")).toBeInTheDocument();
    expect(screen.getByTestId("cigarette-license-payment-error")).toBeInTheDocument();
    expect(
      screen.getByText(Config.cigaretteLicenseShared.alertFieldNames.businessName),
    ).toBeInTheDocument();
  });

  it("calls setStepIndex with correct step when clicking step 2 field error links", async () => {
    const props = {
      ...defaultProps,
      fieldErrors: ["businessName"],
    };

    render(<CigaretteLicenseAlert {...props} />);

    await userEvent.click(
      screen.getByText(Config.cigaretteLicenseShared.alertFieldNames.businessName),
    );
    expect(mockSetStepIndex).toHaveBeenCalledWith(1);
  });

  it("calls setStepIndex with correct step when clicking step 3 field error links", async () => {
    const props = {
      ...defaultProps,
      fieldErrors: ["salesInfoSupplier"],
    };

    render(<CigaretteLicenseAlert {...props} />);

    await userEvent.click(
      screen.getByText(Config.cigaretteLicenseShared.alertFieldNames.salesInfoSupplier),
    );
    expect(mockSetStepIndex).toHaveBeenCalledWith(2);
  });

  it("calls setStepIndex with correct step when clicking step 4 field error links", async () => {
    const props = {
      ...defaultProps,
      fieldErrors: ["signature"],
    };

    render(<CigaretteLicenseAlert {...props} />);

    await userEvent.click(
      screen.getByText(Config.cigaretteLicenseShared.alertFieldNames.signature),
    );
    expect(mockSetStepIndex).toHaveBeenCalledWith(3);
  });

  it("renders field error links with correct href attributes", () => {
    const props = {
      ...defaultProps,
      fieldErrors: ["businessName", "contactEmail"],
    };

    render(<CigaretteLicenseAlert {...props} />);

    const businessNameLink = screen.getByRole("link", {
      name: Config.cigaretteLicenseShared.alertFieldNames.businessName,
    });
    const contactEmailLink = screen.getByRole("link", {
      name: Config.cigaretteLicenseShared.alertFieldNames.contactEmail,
    });

    expect(businessNameLink).toHaveAttribute("href", "#question-businessName");
    expect(contactEmailLink).toHaveAttribute("href", "#question-contactEmail");
  });
});

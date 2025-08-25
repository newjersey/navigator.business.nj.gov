import { AnytimeActionTaxClearanceCertificateAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateAlert";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("<AnytimeActionTaxClearanceCertificateAlert>", () => {
  it("displays single field text in header if there is only one error", () => {
    render(
      <AnytimeActionTaxClearanceCertificateAlert
        fieldErrors={["entityId"]}
        setStepIndex={() => {}}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/review the following field/i)).toBeInTheDocument();
  });

  it("displays multiple fields text in header if there is more than one error", () => {
    render(
      <AnytimeActionTaxClearanceCertificateAlert
        fieldErrors={["requestingAgencyId", "entityId"]}
        setStepIndex={() => {}}
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/review the following fields/i)).toBeInTheDocument();
  });

  it("displays nothing if there are no errors", () => {
    render(<AnytimeActionTaxClearanceCertificateAlert fieldErrors={[]} setStepIndex={() => {}} />);
    expect(screen.queryByTestId("tax-clearance-error-alert")).not.toBeInTheDocument();
  });

  describe.each([
    [
      "INELIGIBLE_TAX_CLEARANCE_FORM" as TaxClearanceCertificateResponseErrorType,
      Config.taxClearanceCertificateStep3.errorTextIneligible,
    ],
    [
      "FAILED_TAX_ID_AND_PIN_VALIDATION" as TaxClearanceCertificateResponseErrorType,
      "Some of the entries in your submission were not valid",
    ],
    [
      "BUSINESS_STATUS_VERIFICATION_ERROR" as TaxClearanceCertificateResponseErrorType,
      Config.taxClearanceCertificateStep3.errorTextStatusVerification,
    ],
    [
      "MISSING_FIELD" as TaxClearanceCertificateResponseErrorType,
      Config.taxClearanceCertificateStep3.errorTextMissingField,
    ],
    [
      "TAX_ID_MISSING_FIELD" as TaxClearanceCertificateResponseErrorType,
      Config.taxClearanceCertificateStep3.errorTextMissingField,
    ],
    [
      "TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE" as TaxClearanceCertificateResponseErrorType,
      Config.taxClearanceCertificateStep3.errorTextMissingField,
    ],
    [
      "NATURAL_PROGRAM_ERROR" as TaxClearanceCertificateResponseErrorType,
      Config.taxClearanceCertificateStep3.errorTextSystem,
    ],
    [
      "TAX_ID_IN_USE_BY_ANOTHER_BUSINESS_ACCOUNT" as TaxClearanceCertificateResponseErrorType,
      "Tax ID is in use by another business account",
    ],
  ])("when responseErrorType is %s", (errorType, expectedMessage) => {
    it(`displays "${expectedMessage}"`, () => {
      render(
        <AnytimeActionTaxClearanceCertificateAlert
          fieldErrors={[]}
          responseErrorType={errorType}
          setStepIndex={() => {}}
        />,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    });
  });
});

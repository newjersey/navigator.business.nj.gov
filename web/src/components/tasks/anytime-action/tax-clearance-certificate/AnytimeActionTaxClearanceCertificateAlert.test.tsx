import { AnytimeActionTaxClearanceCertificateAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateAlert";
import { getMergedConfig } from "@/contexts/configContext";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { render, screen, within } from "@testing-library/react";

const Config = getMergedConfig();

describe("<AnytimeActionTaxClearanceCertificateAlert>", () => {
  it("displays single field text in header if there is only one error", () => {
    render(
      <AnytimeActionTaxClearanceCertificateAlert
        fieldErrors={["entityId"]}
        setStepIndex={() => {}}
      />,
    );
    const profileAlert = screen.getByTestId("tax-clearance-error-alert");
    expect(
      within(profileAlert).getByText(Config.taxClearanceCertificateShared.singularErrorText),
    ).toBeInTheDocument();
  });

  it("displays multiple fields text in header if there is only one error", () => {
    render(
      <AnytimeActionTaxClearanceCertificateAlert
        fieldErrors={["requestingAgencyId", "entityId"]}
        setStepIndex={() => {}}
      />,
    );
    const profileAlert = screen.getByTestId("tax-clearance-error-alert");
    expect(
      within(profileAlert).getByText(Config.taxClearanceCertificateShared.pluralErrorText),
    ).toBeInTheDocument();
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
      Config.taxClearanceCertificateStep3.errorTextValidation,
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
      "GENERIC_ERROR" as TaxClearanceCertificateResponseErrorType,
      Config.taxClearanceCertificateStep3.errorTextSystem,
    ],
    [
      "NATURAL_PROGRAM_ERROR" as TaxClearanceCertificateResponseErrorType,
      Config.taxClearanceCertificateStep3.errorTextSystem,
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

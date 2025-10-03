import { AnytimeActionTaxClearanceCertificateAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateAlert";
import analytics from "@/lib/utils/analytics";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      tax_clearance_anytime_action_help_button: {
        click: {
          open_live_chat: jest.fn(),
          open_live_chat_from_error_alert: jest.fn(),
        },
      },
    },
  };
}

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

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

  it("fires the correct analytics event when live chat button is clicked", async () => {
    render(
      <AnytimeActionTaxClearanceCertificateAlert
        fieldErrors={["requestingAgencyId"]}
        setStepIndex={() => {}}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: Config.taxClearanceCertificateShared.liveChatButtonText }),
    );
    expect(
      mockAnalytics.event.tax_clearance_anytime_action_help_button.click
        .open_live_chat_from_error_alert,
    ).toHaveBeenCalledTimes(1);
  });
});

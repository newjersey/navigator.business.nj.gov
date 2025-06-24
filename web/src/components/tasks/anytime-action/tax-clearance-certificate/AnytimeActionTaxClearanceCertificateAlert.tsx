import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { DevOnlyUnlinkTaxIdButton } from "@/components/tasks/anytime-action/tax-clearance-certificate/DevOnlyUnlinkTaxIdButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

interface Props {
  fieldErrors: string[];
  responseErrorType?: TaxClearanceCertificateResponseErrorType;
  setResponseErrorType?: (errorType: TaxClearanceCertificateResponseErrorType | undefined) => void;
  setStepIndex: (step: number) => void;
}

export const AnytimeActionTaxClearanceCertificateAlert = (props: Props): ReactElement | null => {
  const { Config } = useConfig();

  const fieldErrorsOrder = [
    "requestingAgencyId",
    "businessName",
    "entityId",
    "addressLine1",
    "addressLine2",
    "addressCity",
    "addressState",
    "addressZipCode",
    "taxId",
    "taxPin",
  ];
  const fieldErrors = fieldErrorsOrder.filter((item) => props.fieldErrors.includes(item));

  const getLabel = (field: string): string => {
    // Necessary because Config.formation.fields defaults to type 'any'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const formationLabel = Config.formation.fields[field]?.label;

    const requestingAgencyLabel =
      field === "requestingAgencyId"
        ? Config.taxClearanceCertificateStep2.requestingAgencyLabel
        : "";

    // TODO: Should this be referencing the tax clearance fields?
    return (
      formationLabel ||
      requestingAgencyLabel ||
      getProfileConfig({
        config: Config,
        fieldName: field as ProfileContentField,
      }).header
    );
  };

  const hasErrors = props.fieldErrors.length > 0 || props.responseErrorType !== undefined;

  const getTaxClearanceErrorMessage = (
    errorType: TaxClearanceCertificateResponseErrorType,
  ): string => {
    if (errorType === "INELIGIBLE_TAX_CLEARANCE_FORM") {
      return Config.taxClearanceCertificateStep3.errorTextIneligible;
    }

    if (errorType === "FAILED_TAX_ID_AND_PIN_VALIDATION") {
      return Config.taxClearanceCertificateStep3.errorTextValidation;
    }

    if (
      errorType === "MISSING_FIELD" ||
      errorType === "TAX_ID_MISSING_FIELD" ||
      errorType === "TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE"
    ) {
      return Config.taxClearanceCertificateStep3.errorTextMissingField;
    }

    if (errorType === "TAX_ID_IN_USE_BY_ANOTHER_BUSINESS_ACCOUNT") {
      return Config.taxClearanceCertificateStep3.errorTextPreviouslyReceivedCertificate;
    }

    return Config.taxClearanceCertificateStep3.errorTextSystem;
  };

  return hasErrors ? (
    <Alert className="margin-top-4" variant="error" dataTestid={"tax-clearance-error-alert"}>
      {props.fieldErrors.length > 0 && (
        <>
          <div>
            <span className="text-bold">
              {Config.taxClearanceCertificateShared.preHeaderErrorText}
            </span>{" "}
            {fieldErrors.length === 1
              ? Config.taxClearanceCertificateShared.singularErrorText
              : Config.taxClearanceCertificateShared.pluralErrorText}
          </div>
          <ul>
            {fieldErrors.map((id) => (
              <li key={`${id}`} id={`label-${id}`}>
                <a
                  onClick={() => {
                    props.setStepIndex(1);
                  }}
                  href={`#question-${id}`}
                >
                  {getLabel(id)}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {props.responseErrorType !== undefined && (
        <div data-testid="tax-clearance-response-error">
          <Content>{getTaxClearanceErrorMessage(props.responseErrorType)}</Content>
        </div>
      )}
      {props.responseErrorType === "TAX_ID_IN_USE_BY_ANOTHER_BUSINESS_ACCOUNT" && (
        <DevOnlyUnlinkTaxIdButton setResponseErrorType={props.setResponseErrorType} />
      )}
    </Alert>
  ) : (
    <></>
  );
};

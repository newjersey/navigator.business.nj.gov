import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

interface Props {
  fieldErrors: string[];
  responseErrorType?: TaxClearanceCertificateResponseErrorType;
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

    let requestingAgencyLabel = "";

    if (field === "requestingAgencyId") {
      requestingAgencyLabel = Config.taxClearanceCertificateStep2.requestingAgencyLabel;
    }

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

  return hasErrors ? (
    <Alert variant="error" dataTestid={"tax-clearance-error-alert"}>
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
                <a href={`#question-${id}`}>{getLabel(id)}</a>
              </li>
            ))}
          </ul>
        </>
      )}
      {props.responseErrorType !== undefined && (
        <div>{Config.taxClearanceCertificateStep3.genericTaxClearanceErrorText}</div>
      )}
    </Alert>
  ) : (
    <></>
  );
};

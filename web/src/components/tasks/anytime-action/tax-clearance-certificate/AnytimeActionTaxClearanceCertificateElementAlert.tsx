import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  fieldErrors: string[];
}

export const AnytimeActionTaxClearanceCertificateElementAlert = (props: Props): ReactElement | null => {
  const { Config } = useConfig();

  const displayTaxClearanceErrorAlert = (): boolean => props.fieldErrors.length > 0;

  const customOrder = [
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
  const filteredOrder = customOrder.filter((item) => props.fieldErrors.includes(item));
  props.fieldErrors.sort((a, b) => filteredOrder.indexOf(a) - filteredOrder.indexOf(b));

  const getLabel = (field: string): string => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const formationLabel = Config.formation.fields[field]?.label;

    let requestingAgencyLabel = "";

    if (field === "requestingAgencyId") {
      requestingAgencyLabel = "Requesting Agency";
    }

    return (
      formationLabel ||
      requestingAgencyLabel ||
      getProfileConfig({
        config: Config,
        fieldName: field as ProfileContentField,
      }).header
    );
  };

  if (!displayTaxClearanceErrorAlert()) return null;

  return (
    <Alert variant="error" dataTestid={"tax-clearance-error-alert"}>
      <div>
        <div className="text-bold float-left">{Config.taxClearanceCertificateShared.preHeaderErrorText}</div>
        <div>
          {props.fieldErrors.length === 1
            ? Config.taxClearanceCertificateShared.singularErrorText
            : Config.taxClearanceCertificateShared.pluralErrorText}
        </div>
      </div>
      <ul>
        {props.fieldErrors.map((id) => (
          <li key={`${id}`} id={`label-${id}`}>
            <a href={`#question-${id}`}>{getLabel(id)}</a>
          </li>
        ))}
      </ul>
    </Alert>
  );
};

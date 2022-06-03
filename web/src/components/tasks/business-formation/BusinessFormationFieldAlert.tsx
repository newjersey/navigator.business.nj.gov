import { Alert } from "@/components/njwds-extended/Alert";
import { FormationErrorTypes, FormationFieldErrors } from "@/lib/types/types";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement } from "react";

interface Props {
  showFieldsError: boolean;
  fieldsWithError: FormationFieldErrors[];
  errorType: string;
}

export const BusinessFormationFieldAlert = (props: Props): ReactElement => {
  type ErrorMessages = {
    type: Partial<FormationErrorTypes>;
    label: string;
    priority: number;
    errorType: string;
  };

  //0 is highest priority
  const errorMessages: ErrorMessages[] = [
    {
      type: "signer-checkbox",
      label: Config.businessFormationDefaults.signatureCheckboxErrorText,
      priority: 1,
      errorType: "signature",
    },
    {
      type: "signer-name",
      label: Config.businessFormationDefaults.signersEmptyErrorText,
      priority: 0,
      errorType: "signature",
    },
    {
      type: "signer-minimum",
      label: Config.businessFormationDefaults.signersMinimumErrorText,
      priority: 0,
      errorType: "signature",
    },
    {
      type: "director-minimum",
      label: Config.businessFormationDefaults.directorsMinimumErrorText,
      priority: 0,
      errorType: "director",
    },
  ];

  const getErrorText = (fieldsWithError: FormationFieldErrors[]): string => {
    const currentErrorTypes = [
      ...fieldsWithError.reduce((acc, curr) => {
        curr.types.map((item) => {
          const message = errorMessages.find((message) => message.type == item);
          if (message) acc.add(message);
        });
        return acc;
      }, new Set<ErrorMessages>()),
    ];
    const filteredErrorTypes = currentErrorTypes
      .filter((x) => x.errorType === props.errorType)
      .sort((a, b) => a.priority - b.priority);
    return camelCaseToSentence(filteredErrorTypes[0]?.label ?? "");
  };

  const errorText = getErrorText(props.fieldsWithError);

  return (
    <>
      {props.showFieldsError && props.fieldsWithError.length > 0 && errorText.length > 0 && (
        <Alert variant="error">{errorText}</Alert>
      )}
    </>
  );
};

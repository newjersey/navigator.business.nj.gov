import { Alert } from "@/components/njwds-extended/Alert";
import { FormationErrorTypes, FormationFieldErrors } from "@/lib/types/types";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

interface Props {
  showFieldsError: boolean;
  fieldsWithError: FormationFieldErrors[];
}

export const BusinessFormationFieldAlert = (props: Props): ReactElement => {
  type ErrorMessages = { type: Partial<FormationErrorTypes>; label: string; priority: number };

  //0 is highest priority
  const errorMessages: ErrorMessages[] = [
    {
      type: "signer-checkbox",
      label: Config.businessFormationDefaults.signatureCheckboxErrorText,
      priority: 1,
    },
    { type: "signer-name", label: Config.businessFormationDefaults.signersEmptyErrorText, priority: 0 },
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
    currentErrorTypes.sort((a, b) => a.priority - b.priority);
    return camelCaseToSentence(currentErrorTypes[0]?.label ?? "");
  };

  return (
    <>
      {props.showFieldsError && props.fieldsWithError.length > 0 && (
        <Alert variant="error">{getErrorText(props.fieldsWithError)}</Alert>
      )}
    </>
  );
};

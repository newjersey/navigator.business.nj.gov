import { Alert } from "@/components/njwds-extended/Alert";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFormData } from "@businessnjgovnavigator/shared";
import React, { ReactElement } from "react";

interface Props {
  showRequiredFieldsError: boolean;
  requiredFieldsWithError: (keyof FormationFormData)[];
}

export const BusinessFormationFieldAlert = (props: Props): ReactElement => {
  return (
    <>
      {props.showRequiredFieldsError && props.requiredFieldsWithError.length > 0 && (
        <Alert variant="error" heading={Config.businessFormationDefaults.missingFieldsOnSubmitModalText}>
          <ul>
            {props.requiredFieldsWithError.map((it) => (
              <li key={it}>{camelCaseToSentence(it)}</li>
            ))}
          </ul>
        </Alert>
      )}
    </>
  );
};

import { Alert } from "@/components/njwds-extended/Alert";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
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
        <Alert variant="error" heading={Defaults.businessFormationDefaults.missingFieldsOnSubmitModalText}>
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

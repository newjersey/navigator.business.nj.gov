import { Alert } from "@/components/njwds-extended/Alert";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFormData } from "@businessnjgovnavigator/shared/";
import React, { ReactElement } from "react";

interface Props {
  readonly showRequiredFieldsError: boolean;
  readonly requiredFieldsWithError: readonly (keyof FormationFormData)[];
}

export const BusinessFormationFieldAlert = (props: Props): ReactElement => {
  return (
    <>
      {props.showRequiredFieldsError && props.requiredFieldsWithError.length > 0 && (
        <Alert variant="error">
          <div>{Config.businessFormationDefaults.missingFieldsOnSubmitModalText}</div>
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

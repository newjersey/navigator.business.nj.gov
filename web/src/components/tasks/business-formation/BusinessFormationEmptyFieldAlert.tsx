import { Alert } from "@/components/njwds-extended/Alert";
import { FormationErrorType, FormationFieldErrorMap } from "@/lib/types/types";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import FormationErrors from "@businessnjgovnavigator/content/fieldConfig/formation-error.json";

import { FormationFields } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

interface Props {
  showErrors: boolean;
  errorData: FormationFieldErrorMap;
}

export const BusinessFormationEmptyFieldAlert = (props: Props): ReactElement => {
  const errors = Object.keys(props.errorData)
    .filter((i) => props.errorData[i as FormationFields].invalid)
    .map((i) => ({ ...props.errorData[i as FormationFields], name: i }));

  const errorTypes = [
    ...new Set(
      errors.flatMap((er) => {
        const errors = FormationErrors.formationErrors.filter(
          (inEr) =>
            inEr.fields.includes(er.name as string) &&
            (er?.types ? er.types.includes(inEr.type as FormationErrorType) : true)
        );
        if (errors.length === 0) return { label: camelCaseToSentence(er.name), fields: [er.name] };
        return errors;
      })
    ),
  ];

  return (
    <>
      {props.showErrors && errorTypes.length > 0 && (
        <Alert variant="error">
          <div>{Config.businessFormationDefaults.missingFieldsOnSubmitModalText}</div>
          <ul>
            {errorTypes.map((it) => (
              <li key={it.label} data-testid={it.fields.join("_")}>
                {it.label}
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </>
  );
};

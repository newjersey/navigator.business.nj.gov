import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationErrorType, FormationFieldErrorMap } from "@/lib/types/types";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import FormationErrors from "@businessnjgovnavigator/content/fieldConfig/formation-error.json";

import { FormationFields } from "@businessnjgovnavigator/shared";
import { FormationSubmitError } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

interface Props {
  showErrors: boolean;
  errorData: FormationFieldErrorMap;
}

export const BusinessFormationAlert = (props: Props): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { userData } = useUserData();
  const errors = Object.keys(props.errorData)
    .filter((i) => props.errorData[i as FormationFields].invalid)
    .map((i) => ({ ...props.errorData[i as FormationFields], name: i }));

  type FormationErrors = {
    fields: string[];
    label: string;
    message?: string;
    type?: undefined;
  };

  const errorTypes: FormationErrors[] = [
    ...new Set(
      errors.flatMap((er) => {
        let errors = FormationErrors.formationErrors.filter((inEr) =>
          inEr.fields.includes(er.name as string)
        );
        const typedErrors = errors.filter((inEr) =>
          er?.types ? er.types.includes(inEr.type as FormationErrorType) : true
        );
        errors = typedErrors.length > 0 ? typedErrors : errors;
        if (errors.length === 0) return { label: camelCaseToSentence(er.name), fields: [er.name] };
        return errors;
      })
    ),
  ];
  return (
    <>
      {((props.showErrors && errorTypes.length > 0) ||
        (state.showResponseAlert &&
          (userData?.formationData?.formationResponse?.errors?.length ?? 0) > 0)) && (
        <Alert variant="error">
          <div>{Config.businessFormationDefaults.missingFieldsOnSubmitModalText}</div>
          <ul>
            {props.showErrors &&
              errorTypes.map((it) => (
                <li key={it.label} data-testid={it.fields.join("_")}>
                  <Content>{it.label}</Content>
                  {it.message && (
                    <ul>
                      <li>
                        <Content>{it.message}</Content>
                      </li>
                    </ul>
                  )}
                </li>
              ))}
            {state.showResponseAlert &&
              userData?.formationData?.formationResponse?.errors.map((it: FormationSubmitError) => {
                const error = FormationErrors.apiErrors.find(
                  (i) => i.field === it.field || i.field === it.type
                );
                return (
                  <li key={it.field}>
                    {error?.label ?? it.field}
                    <ul>
                      <li>
                        <Content>{error?.message ?? it.message}</Content>
                      </li>
                    </ul>
                  </li>
                );
              })}
          </ul>
        </Alert>
      )}
    </>
  );
};

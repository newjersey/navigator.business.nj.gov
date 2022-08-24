import { Alert } from "@/components/njwds-extended/Alert";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationErrorType } from "@/lib/types/types";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import FormationErrors from "@businessnjgovnavigator/content/fieldConfig/formation-error.json";

import { FormationFields } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

interface Props {
  fields: FormationFields[];
}

export const BusinessFormationFieldAlert = (props: Props): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const errors = props.fields.map((i) => ({ ...state.errorMap[i], name: i })).filter((i) => i.invalid);
  const errorTypes = errors.flatMap((er) =>
    FormationErrors.inlineErrors.filter(
      (inEr) =>
        inEr.fields.includes(er.name as string) &&
        (er?.types ? er.types.includes(inEr.type as FormationErrorType) : true)
    )
  );
  const sortedErrors = [
    ...errorTypes
      .filter((i) => i?.priority != undefined)
      .sort((a, b) => (a?.priority as number) - (b?.priority as number)),
    ...errorTypes.filter((i) => i?.priority === undefined),
  ];
  return (
    <>
      {state.showErrors && errors.length > 0 && sortedErrors.length > 0 && (
        <Alert variant="error">{camelCaseToSentence(sortedErrors[0]?.label ?? "")}</Alert>
      )}
    </>
  );
};

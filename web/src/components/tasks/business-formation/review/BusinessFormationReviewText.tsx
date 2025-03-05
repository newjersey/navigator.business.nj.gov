import { ReviewText } from "@/components/tasks/review-screen-components/ReviewText";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { camelCaseToKebabCase } from "@/lib/utils/cases-helpers";
import { FormationTextField } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: FormationTextField;
  isExpandable?: boolean;
}
export const BusinessFormationReviewText = (props: Props): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const kebabCaseFieldName = camelCaseToKebabCase(props.fieldName);

  return (
    <ReviewText
      isExpandable={props.isExpandable}
      text={state.formationFormData[props.fieldName]}
      dataTestId={kebabCaseFieldName}
    />
  );
};

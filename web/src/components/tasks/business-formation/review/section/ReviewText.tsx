import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { ReviewNotEntered } from "@/components/tasks/business-formation/review/section/ReviewNotEntered";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { camelCaseToKebabCase } from "@/lib/utils/cases-helpers";
import { FormationTextField } from "@businessnjgovnavigator/shared/formationData";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: FormationTextField;
  isExpandable?: boolean;
}
export const ReviewText = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const kebabCaseFieldName = camelCaseToKebabCase(props.fieldName);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  return (
    <>
      {props.isExpandable && state.formationFormData[props.fieldName] ? (
        <ExpandCollapseString
          text={state.formationFormData[props.fieldName] as string}
          dataTestId={kebabCaseFieldName}
          viewMoreText={Config.formation.general.viewMoreButtonText}
          viewLessText={Config.formation.general.viewLessButtonText}
          lines={2}
        />
      ) : (
        <div
          className={`${isTabletAndUp ? "display-flex" : "display-block"}`}
          data-testid={kebabCaseFieldName}
        >
          <div>{state.formationFormData[props.fieldName] || <ReviewNotEntered />}</div>
        </div>
      )}
    </>
  );
};

import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { FormationStepNames } from "@/lib/types/types";
import { camelCaseToKebabCase } from "@/lib/utils/cases-helpers";
import { scrollToTop } from "@/lib/utils/helpers";
import { FormationTextField } from "@businessnjgovnavigator/shared/formationData";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props {
  header: string;
  fieldName: FormationTextField;
  stepName: FormationStepNames;
}
export const ReviewText = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const kebabCaseFieldName = camelCaseToKebabCase(props.fieldName);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <h2 className="h3-styling">{props.header}</h2>
        </div>
        <div className="margin-left-2">
          <UnStyledButton
            style="tertiary"
            onClick={(): void => {
              setStepIndex(LookupStepIndexByName(props.stepName));
              scrollToTop();
            }}
            underline
            dataTestid={`edit-${kebabCaseFieldName}`}
          >
            {Config.formation.general.editButtonText}
          </UnStyledButton>
        </div>
      </div>
      <div className={`${isTabletAndUp ? "display-flex" : "display-block"}`} data-testid={kebabCaseFieldName}>
        <div>{state.formationFormData[props.fieldName] || <i>{Config.formation.general.notEntered}</i>}</div>
      </div>
      <hr className="margin-y-205" />
    </>
  );
};

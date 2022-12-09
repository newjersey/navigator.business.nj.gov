import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationStepNames } from "@/lib/types/types";
import { camelCaseToKebabCase } from "@/lib/utils/cases-helpers";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationTextField } from "@businessnjgovnavigator/shared/formationData";
import { useContext } from "react";

interface Props {
  header: string;
  fieldName: FormationTextField;
  stepName: FormationStepNames;
}
export const ReviewText = (props: Props) => {
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");
  const kebabCaseFieldName = camelCaseToKebabCase(props.fieldName);
  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>{props.header}</Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setStepIndex(LookupStepIndexByName(props.stepName));
              scrollToTop();
            }}
            underline
            dataTestid={`edit-${kebabCaseFieldName}`}
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="display-block tablet:display-flex" data-testid={kebabCaseFieldName}>
        <div>
          {state.formationFormData[props.fieldName] || (
            <i>{Config.businessFormationDefaults.reviewStepNotEnteredText}</i>
          )}
        </div>
      </div>
      <hr className="margin-y-205" />
    </>
  );
};

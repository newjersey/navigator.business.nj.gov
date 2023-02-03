import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationStepNames } from "@/lib/types/types";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

interface Props {
  header: string;
  stepName: FormationStepNames;
  testId: string;
}

export const ReviewSectionHeader = (props: Props): ReactElement => {
  const { setStepIndex } = useContext(BusinessFormationContext);

  return (
    <div className="flex space-between">
      <div className="maxw-mobile-lg margin-bottom-2">
        <h2 className="h3-styling">{props.header}</h2>
      </div>
      <div className="margin-left-2">
        <UnStyledButton
          style="tertiary"
          onClick={() => {
            setStepIndex(LookupStepIndexByName(props.stepName));
            scrollToTop();
          }}
          underline
          dataTestid={`edit-${props.testId}-step`}
        >
          {Config.businessFormationDefaults.editButtonText}
        </UnStyledButton>
      </div>
    </div>
  );
};

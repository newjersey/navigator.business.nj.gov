import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationStepNames } from "@/lib/types/types";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

interface Props {
  header: string;
  stepName: FormationStepNames;
  testId: string;
}

export const ReviewSectionHeader = (props: Props): ReactElement => {
  const { setStepIndex } = useContext(BusinessFormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
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
          dataTestid={`edit-${props.testId}-step`}
        >
          {Config.businessFormationDefaults.editButtonText}
        </Button>
      </div>
    </div>
  );
};

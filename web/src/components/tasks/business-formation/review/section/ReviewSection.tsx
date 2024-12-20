import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormationStepNames } from "@/lib/types/types";
import { scrollToTop } from "@/lib/utils/helpers";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  stepName: FormationStepNames;
  testId?: string;
  children: ReactNode;
}

export const ReviewSection = (props: Props): ReactElement<any> => {
  const { setStepIndex } = useContext(BusinessFormationContext);
  const { Config } = useConfig();
  const onClick = (): void => {
    setStepIndex(LookupStepIndexByName(props.stepName));
    scrollToTop();
  };

  return (
    <>
      <div className={"flex space-between"}>
        <div className={"maxw-mobile-lg margin-bottom-2"}>
          <Heading level={2}>{props.stepName}</Heading>
        </div>
        <div className="margin-left-2">
          <UnStyledButton
            onClick={onClick}
            isUnderline
            dataTestid={props.testId}
            ariaLabel={`${Config.formation.general.editButtonText} ${props.stepName}`}
          >
            {Config.formation.general.editButtonText}
          </UnStyledButton>
        </div>
      </div>
      {props.children}
      <hr className="margin-y-205" />
    </>
  );
};

import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationStepNames } from "@/lib/types/types";
import { scrollToTop } from "@/lib/utils/helpers";
import { PropsWithChildren, useContext } from "react";

interface Props {
  buttonText: string;
  handleButtonClick?: () => void;
  header: string;
  stepName: FormationStepNames;
  testId: string;
}

export const ReviewSection: React.FC<PropsWithChildren<Props>> = ({
  children,
  buttonText,
  handleButtonClick,
  header,
  stepName,
  testId,
}) => {
  const { setStepIndex } = useContext(BusinessFormationContext);
  const onClick = (): void => {
    if (handleButtonClick === undefined) {
      setStepIndex(LookupStepIndexByName(stepName));
      scrollToTop();
    } else {
      handleButtonClick();
    }
  };

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <h2 className="h3-styling">{header}</h2>
        </div>
        <div className="margin-left-2">
          <UnStyledButton style="tertiary" onClick={onClick} underline dataTestid={testId}>
            {buttonText}
          </UnStyledButton>
        </div>
      </div>
      {children}
      <hr className="margin-y-205" />
    </>
  );
};

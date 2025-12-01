import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { ReviewSection } from "@/components/tasks/review-screen-components/ReviewSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { scrollToTop } from "@/lib/utils/helpers";
import { FormationStepNames } from "@businessnjgovnavigator/shared/types";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  stepName: FormationStepNames;
  dataTestId?: string;
  children: ReactNode;
}

export const BusinessFormationReviewSection = (props: Props): ReactElement => {
  const { setStepIndex } = useContext(BusinessFormationContext);
  const onClick = (): void => {
    setStepIndex(LookupStepIndexByName(props.stepName));
    scrollToTop();
  };

  return (
    <ReviewSection
      headingText={props.stepName}
      editHandleButtonClick={onClick}
      dataTestId={props.dataTestId}
    >
      {props.children}
    </ReviewSection>
  );
};

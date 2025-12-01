import { LookupStepIndexByName } from "@/components/tasks/abc-emergency-trip-permit/steps/EmergencyTripPermitStepsConfiguration";
import { ReviewSection } from "@/components/tasks/review-screen-components/ReviewSection";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { scrollToTop } from "@/lib/utils/helpers";
import { EmergencyTripPermitStepNames } from "@businessnjgovnavigator/shared/types";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  stepName: EmergencyTripPermitStepNames;
  dataTestId?: string;
  children: ReactNode;
}

export const EmergencyTripPermitReviewSection = (props: Props): ReactElement => {
  const { setStepIndex } = useContext(EmergencyTripPermitContext);
  const onClick = (): void => {
    setStepIndex(LookupStepIndexByName(props.stepName));
    scrollToTop({ smooth: true });
  };

  const getHeaderText = (): string => {
    if (props.stepName === "Billing") {
      return props.stepName;
    } else return `${props.stepName} Information`;
  };

  return (
    <ReviewSection
      headingText={getHeaderText()}
      editHandleButtonClick={onClick}
      dataTestId={props.dataTestId}
    >
      {props.children}
    </ReviewSection>
  );
};

import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingRealEstateAppraisalManagement = (): ReactElement => {
  return (
    <OnboardingRadioQuestion<boolean> fieldName={"realEstateAppraisalManagement"} choices={[true, false]} />
  );
};

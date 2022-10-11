import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingStaffingService = (): ReactElement => {
  return <OnboardingRadioQuestion<boolean> fieldName={"providesStaffingService"} choices={[true, false]} />;
};

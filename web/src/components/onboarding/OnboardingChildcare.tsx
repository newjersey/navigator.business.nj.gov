import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingChildcare = (): ReactElement => {
  return <OnboardingRadioQuestion<boolean> fieldName={"isChildcareForSixOrMore"} choices={[true, false]} />;
};

import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingCpa = (): ReactElement => {
  return <OnboardingRadioQuestion<boolean> fieldName={"requiresCpa"} choices={[true, false]} />;
};

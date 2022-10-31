import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingHomeBasedBusiness = (): ReactElement => {
  return <OnboardingRadioQuestion<boolean> fieldName={"homeBasedBusiness"} choices={[true, false]} />;
};

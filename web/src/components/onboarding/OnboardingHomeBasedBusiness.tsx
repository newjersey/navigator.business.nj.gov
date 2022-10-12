import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingHomeBasedBusiness = (): ReactElement => (
  <OnboardingRadioQuestion<boolean> fieldName={"homeBasedBusiness"} choices={[true, false]} />
);

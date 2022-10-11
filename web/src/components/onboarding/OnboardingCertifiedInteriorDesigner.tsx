import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingCertifiedInteriorDesigner = (): ReactElement => {
  return <OnboardingRadioQuestion<boolean> fieldName={"certifiedInteriorDesigner"} choices={[true, false]} />;
};

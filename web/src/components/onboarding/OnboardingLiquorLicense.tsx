import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";

import { ReactElement } from "react";

export const OnboardingLiquorLicense = (): ReactElement => {
  return <OnboardingRadioQuestion<boolean> fieldName={"liquorLicense"} choices={[true, false]} />;
};

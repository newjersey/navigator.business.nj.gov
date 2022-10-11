import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingMovingCompany = (): ReactElement => {
  return (
    <OnboardingRadioQuestion<boolean>
      fieldName={"interstateTransport"}
      choices={[true, false]}
      ariaLabel={"Moves Goods Across State Lines"}
    />
  );
};

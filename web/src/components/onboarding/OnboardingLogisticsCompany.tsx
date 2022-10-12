import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ReactElement } from "react";

export const OnboardingLogisticsCompany = (): ReactElement => {
  return (
    <OnboardingRadioQuestion<boolean>
      fieldName={"interstateTransport"}
      contentFieldName={"interstateLogistics"}
      choices={[true, false]}
    />
  );
};

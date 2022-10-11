import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { CannabisLicenseType } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

export const OnboardingCannabisLicense = (): ReactElement => {
  return (
    <OnboardingRadioQuestion<CannabisLicenseType>
      fieldName={"cannabisLicenseType"}
      choices={["CONDITIONAL", "ANNUAL"]}
    />
  );
};

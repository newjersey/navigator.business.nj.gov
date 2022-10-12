import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { CarServiceType } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

export const OnboardingCarService = (): ReactElement => {
  return (
    <OnboardingRadioQuestion<CarServiceType>
      fieldName={"carService"}
      choices={["STANDARD", "HIGH_CAPACITY", "BOTH"]}
    />
  );
};

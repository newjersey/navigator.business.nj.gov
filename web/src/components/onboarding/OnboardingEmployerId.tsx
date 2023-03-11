import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingEmployerId = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const fieldName = "employerId";

  return (
    <>
      <OnboardingNumericField
        fieldName={fieldName}
        validationText={templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
          length: "9",
        })}
        visualFilter={displayAsEin}
        maxLength={9}
        minLength={9}
        handleChange={props.handleChangeOverride}
      />
    </>
  );
};

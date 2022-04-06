import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  headerAriaLevel?: number;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingEmployerId = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const fieldName = "employerId";

  return (
    <>
      <div role="heading" aria-level={headerAriaLevel} className="h3-styling margin-bottom-2">
        {state.displayContent.employerId.headingBolded}{" "}
        <span className="text-light">{state.displayContent.employerId.headingNotBolded}</span>
      </div>
      <OnboardingNumericField
        fieldName={fieldName}
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        validationText={templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
          length: "9",
        })}
        visualFilter={displayAsEin}
        maxLength={9}
        minLength={9}
        headerAriaLevel={headerAriaLevel}
        handleChange={props.handleChangeOverride}
      />
    </>
  );
};

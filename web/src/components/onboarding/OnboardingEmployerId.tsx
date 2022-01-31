import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import React, { ReactElement, useContext } from "react";
import { OnboardingNumericField } from "./OnboardingNumericField";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingEmployerId = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const fieldName = "employerId";

  return (
    <>
      <div role="heading" aria-level={2} className="h3-styling margin-bottom-2">
        {state.displayContent.employerId.headingBolded}{" "}
        <span className="text-light">{state.displayContent.employerId.headingNotBolded}</span>
      </div>
      <OnboardingNumericField
        fieldName={fieldName}
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        validationText={templateEval(OnboardingDefaults.errorTextMinimumNumericField, {
          length: "9",
        })}
        visualFilter={displayAsEin}
        maxLength={9}
        minLength={9}
      />
    </>
  );
};

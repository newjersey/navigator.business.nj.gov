import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import React, { FocusEvent, ReactElement, useContext } from "react";
import { OnboardingField } from "./OnboardingField";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingEmployerId = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length === 10 || event.target.value.length === 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(fieldName, false);

  const fieldName = "employerId";

  const dataFormat = (value: string): string => value.replace(/[^0-9]/g, "");

  return (
    <>
      <div role="heading" aria-level={2} className="h3-styling margin-bottom-2">
        {state.displayContent.employerId.headingBolded}{" "}
        <span className="text-light">{state.displayContent.employerId.headingNotBolded}</span>
      </div>
      <OnboardingField
        fieldName={fieldName}
        onValidation={onValidation}
        handleChange={handleChange}
        error={props.fieldStates[fieldName].invalid}
        validationText={templateEval(OnboardingDefaults.errorTextMinimumNumericField, {
          length: "10",
        })}
        valueFilter={dataFormat}
        visualFilter={displayAsEin}
        fieldOptions={{
          inputProps: { inputMode: "numeric", maxLength: "10" },
        }}
      />
    </>
  );
};

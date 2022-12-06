import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ReactElement, ReactNode } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  children?: ReactNode;
  fieldStates: ProfileFieldErrorMap;
  disabled?: boolean;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingEntityId = (props: Props): ReactElement => {
  const fieldName = "entityId";

  return (
    <>
      <OnboardingNumericField
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={10}
        disabled={props.disabled}
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};

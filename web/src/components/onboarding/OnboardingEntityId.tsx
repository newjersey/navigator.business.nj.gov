import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ReactElement, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  disabled?: boolean;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingEntityId = (props: Props): ReactElement => {
  const fieldName = "entityId";

  return (
    <>
      <OnboardingNumericField
        fieldName={fieldName}
        maxLength={10}
        disabled={props.disabled}
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};

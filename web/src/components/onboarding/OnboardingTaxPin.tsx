import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
  children?: ReactNode;
  headerAriaLevel?: number;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingTaxPin = (props: Props): ReactElement => {
  const fieldName = "taxPin";
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  return (
    <>
      <OnboardingNumericField
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={4}
        minLength={4}
        validationText={Config.profileDefaults[state.flow].taxPin.errorText}
        headerAriaLevel={props.headerAriaLevel}
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};

import { OnboardingField } from "@/components/onboarding/OnboardingField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { ReactElement, useContext } from "react";

interface Props {
  onValidation?: (field: ProfileFields, invalid: boolean) => void;
  fieldStates?: ProfileFieldErrorMap;
  headerAriaLevel?: number;
  disabled?: boolean;
}

export const OnboardingBusinessName = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  return (
    <OnboardingField
      fieldName="businessName"
      onValidation={props.onValidation}
      error={props.fieldStates ? props.fieldStates.businessName.invalid : false}
      required={true}
      validationText={Config.profileDefaults[state.flow].businessName.errorTextRequired}
      headerAriaLevel={props.headerAriaLevel}
      disabled={props.disabled}
      fieldOptions={{
        inputProps: { "data-testid": "businessName" },
      }}
    />
  );
};

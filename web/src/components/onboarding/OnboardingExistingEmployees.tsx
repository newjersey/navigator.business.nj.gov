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
}

export const OnboardingExistingEmployees = (props: Props): ReactElement => {
  const fieldName = "existingEmployees";
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  return (
    <>
      <OnboardingNumericField
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={7}
        minLength={1}
        validationText={Config.profileDefaults[state.flow].existingEmployees.errorTextRequired}
        required={true}
        headerAriaLevel={props.headerAriaLevel}
      />
      {props.children}
    </>
  );
};

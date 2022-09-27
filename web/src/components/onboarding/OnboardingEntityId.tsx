import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  children?: ReactNode;
  fieldStates: ProfileFieldErrorMap;
  disabled?: boolean;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingEntityId = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const fieldName = "entityId";

  if (
    state.profileData.businessPersona === "STARTING" &&
    !isEntityIdApplicable(state.profileData.legalStructureId)
  ) {
    return <></>;
  }

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

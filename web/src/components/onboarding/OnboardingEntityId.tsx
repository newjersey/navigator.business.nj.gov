import { OnboardingNumericField } from "@/components/onboarding/OnboardingNumericField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import React, { ReactElement, ReactNode, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  children?: ReactNode;
  fieldStates: ProfileFieldErrorMap;
  disabled?: boolean;
  headerAriaLevel?: number;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingEntityId = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const fieldName = "entityId";
  const { Config } = useConfig();

  if (
    state.profileData.businessPersona === "STARTING" &&
    !isEntityIdApplicable(state.profileData.legalStructureId)
  ) {
    return <></>;
  }

  return (
    <>
      <div role="heading" aria-level={headerAriaLevel} className="h3-styling margin-bottom-2">
        {Config.profileDefaults[state.flow].entityId.header}{" "}
        <span className="text-light">{Config.profileDefaults[state.flow].entityId.headerNotBolded}</span>
      </div>
      <OnboardingNumericField
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={10}
        disabled={props.disabled}
        headerAriaLevel={headerAriaLevel}
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};

import { NumericField } from "@/components/onboarding/NumericField";
import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { OnboardingContext } from "@/pages/onboarding";
import React, { ReactElement, ReactNode, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  children?: ReactNode;
  fieldStates: ProfileFieldErrorMap;
}
export const OnboardingEntityId = (props: Props): ReactElement => {
  const { state } = useContext(OnboardingContext);
  const fieldName = "entityId";

  if (!isEntityIdApplicable(state.profileData.legalStructureId) && !state.profileData.hasExistingBusiness) {
    return <></>;
  }

  return (
    <>
      <NumericField
        onValidation={props.onValidation}
        invalid={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={10}
      />
      {props.children}
    </>
  );
};

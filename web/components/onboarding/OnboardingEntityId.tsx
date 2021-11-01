import React, { ReactElement, ReactNode, useContext } from "react";
import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import { ProfileFields, ProfileFieldErrorMap } from "@/lib/types/types";
import { OnboardingContext } from "@/pages/onboarding";
import { NumericField } from "@/components/onboarding/NumericField";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  children: ReactNode;
  fieldStates: ProfileFieldErrorMap;
}
export const OnboardingEntityId = (props: Props): ReactElement => {
  const { state } = useContext(OnboardingContext);
  const fieldName = "entityId";

  if (!isEntityIdApplicable(state.profileData.legalStructureId)) {
    return <></>;
  }

  return (
    <>
      <NumericField
        onValidation={props.onValidation}
        invalid={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        length={10}
      />
      {props.children}
    </>
  );
};

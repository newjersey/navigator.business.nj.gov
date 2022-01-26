import { NumericField } from "@/components/onboarding/NumericField";
import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { ProfileDataContext } from "@/pages/onboarding";
import React, { ReactElement, ReactNode, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  children?: ReactNode;
  fieldStates: ProfileFieldErrorMap;
  disabled?: boolean;
}

export const OnboardingEntityId = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const fieldName = "entityId";

  if (!isEntityIdApplicable(state.profileData.legalStructureId) && !state.profileData.hasExistingBusiness) {
    return <></>;
  }

  return (
    <>
      <div role="heading" aria-level={2} className="h3-styling margin-bottom-2">
        {state.displayContent.entityId.headingBolded}{" "}
        <span className="text-light">{state.displayContent.entityId.headingNotBolded}</span>
      </div>
      <NumericField
        onValidation={props.onValidation}
        error={props.fieldStates[fieldName].invalid}
        fieldName={fieldName}
        maxLength={10}
        minLength={10}
        disabled={props.disabled}
      />
      {props.children}
    </>
  );
};

import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import { ProfileFields, ProfileFieldErrorMap } from "@/lib/types/types";
import { OnboardingContext } from "@/pages/onboarding";
import React, { ReactElement, FocusEvent, ReactNode, useContext } from "react";
import { OnboardingField } from "./OnboardingField";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  children: ReactNode;
  fieldStates: ProfileFieldErrorMap;
}
export const OnboardingEntityId = (props: Props): ReactElement => {
  const { state } = useContext(OnboardingContext);
  const fieldName = "entityId";

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length === 10 || event.target.value.length === 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(fieldName, false);

  const regex = (value: string): string => value.replace(/[^0-9]/g, "");

  if (!isEntityIdApplicable(state.onboardingData.legalStructure)) {
    return <></>;
  }
  return (
    <>
      <OnboardingField
        fieldName={fieldName}
        onValidation={onValidation}
        validationLabel="Error"
        error={props.fieldStates[fieldName].invalid}
        validationText="Must be 10 digits long"
        visualFilter={regex}
        handleChange={handleChange}
        fieldOptions={{
          inputProps: { inputMode: "numeric", maxLength: "10" },
        }}
      />
      {props.children}
    </>
  );
};

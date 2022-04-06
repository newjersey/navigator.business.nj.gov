import { OnboardingField } from "@/components/onboarding/OnboardingField";
import React, { ReactElement } from "react";

interface Props {
  headerAriaLevel?: number;
  handleChangeOverride?: (value: string) => void;
}

export const OnboardingNotes = ({ headerAriaLevel = 2, ...props }: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName={"notes"}
      fieldOptions={{ multiline: true, minRows: 4, inputProps: { maxLength: "500" } }}
      headerAriaLevel={headerAriaLevel}
      handleChange={props.handleChangeOverride}
    />
  );
};

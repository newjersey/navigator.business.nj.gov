import React, { ReactElement } from "react";
import { OnboardingField } from "./OnboardingField";

interface Props {
  headerAriaLevel?: number;
}

export const OnboardingNotes = ({ headerAriaLevel = 2 }: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName={"notes"}
      fieldOptions={{ multiline: true, minRows: 4, inputProps: { maxLength: "500" } }}
      headerAriaLevel={headerAriaLevel}
    />
  );
};

import React, { ReactElement } from "react";
import { OnboardingField } from "./OnboardingField";

export const OnboardingNotes = (): ReactElement => {
  return (
    <OnboardingField
      fieldName={"notes"}
      fieldOptions={{ multiline: true, minRows: 4, inputProps: { maxLength: "500" } }}
    />
  );
};

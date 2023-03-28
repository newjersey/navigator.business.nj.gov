/* eslint-disable unicorn/filename-case */

import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { TextFieldProps } from "@mui/material";
import { ReactElement } from "react";

interface Props extends Omit<OnboardingProps, "fieldName"> {
  fieldOptions?: TextFieldProps;
}

export const ProfileNexusDBANameField = (props: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName={"nexusDbaName"}
      fieldOptions={{
        inputProps: { "data-testid": "nexusDBAName" },
      }}
      {...props}
    />
  );
};

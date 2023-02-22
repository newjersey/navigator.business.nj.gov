/* eslint-disable unicorn/filename-case */

import { OnboardingField, OnboardingProps } from "@/components/onboarding/OnboardingField";
import { ProfileFieldErrorMap } from "@/lib/types/types";
import { TextFieldProps } from "@mui/material";
import { ReactElement } from "react";

interface Props extends Omit<OnboardingProps, "fieldName"> {
  fieldStates?: Partial<ProfileFieldErrorMap>;
  required?: boolean;
  fieldOptions?: TextFieldProps;
}

export const ProfileNexusDBANameField = (props: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName={"nexusDbaName"}
      error={props.fieldStates ? props.fieldStates.nexusDbaName?.invalid : false}
      fieldOptions={{
        inputProps: { "data-testid": "nexusDBAName" },
      }}
      {...props}
    />
  );
};

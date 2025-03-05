/* eslint-disable unicorn/filename-case */

import { ProfileDataField, ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { TextFieldProps } from "@mui/material";
import { ReactElement } from "react";

interface Props extends Omit<ProfileDataFieldProps, "fieldName" | "inputWidth"> {
  fieldOptions?: TextFieldProps;
}

export const NexusDBANameField = (props: Props): ReactElement => {
  return (
    <ProfileDataField
      fieldName={"nexusDbaName"}
      fieldOptions={{
        inputProps: { "data-testid": "nexusDBAName" },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

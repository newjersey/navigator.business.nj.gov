import type { TextFieldProps } from "@mui/material";
import type { ReactElement } from "react";
import {
  ProfileDataField,
  type ProfileDataFieldProps,
} from "@/components/data-fields/ProfileDataField";

interface Props extends Omit<ProfileDataFieldProps, "fieldName" | "inputWidth"> {
  fieldOptions?: TextFieldProps;
}

export const NexusDBANameField = (props: Props): ReactElement => {
  return (
    <ProfileDataField
      fieldName={"nexusDbaName"}
      fieldOptions={{
        slotProps: { htmlInput: { "data-testid": "nexusDBAName" } },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

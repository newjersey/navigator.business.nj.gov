import type { ReactElement } from "react";
import {
  ProfileDataField,
  type ProfileDataFieldProps,
} from "@/components/data-fields/ProfileDataField";

export const BusinessName = (props: Omit<ProfileDataFieldProps, "fieldName">): ReactElement => {
  return (
    <ProfileDataField
      fieldOptions={{
        slotProps: { htmlInput: { "data-testid": "businessName" } },
      }}
      {...props}
      fieldName="businessName"
      inputWidth={props.inputWidth ?? "default"}
      validationText={props.validationText}
      required={props.required}
    />
  );
};

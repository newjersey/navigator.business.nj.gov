import { ProfileDataField, ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { ReactElement } from "react";

export const BusinessName = (props: Omit<ProfileDataFieldProps, "fieldName">): ReactElement => {
  return (
    <ProfileDataField
      fieldOptions={{
        inputProps: { "data-testid": "businessName" },
      }}
      {...props}
      fieldName="businessName"
      inputWidth={props.inputWidth ?? "default"}
    />
  );
};

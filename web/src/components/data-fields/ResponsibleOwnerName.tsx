import { ProfileDataField, ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { ReactElement } from "react";

export const ResponsibleOwnerName = (props: Omit<ProfileDataFieldProps, "fieldName">): ReactElement => {
  return (
    <ProfileDataField
      fieldName="responsibleOwnerName"
      fieldOptions={{
        inputProps: { "data-testid": "responsibleOwnerName" },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

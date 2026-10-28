import type { ReactElement } from "react";
import {
  ProfileDataField,
  type ProfileDataFieldProps,
} from "@/components/data-fields/ProfileDataField";

export const ResponsibleOwnerName = (
  props: Omit<ProfileDataFieldProps, "fieldName">,
): ReactElement => {
  return (
    <ProfileDataField
      fieldName="responsibleOwnerName"
      fieldOptions={{
        slotProps: { htmlInput: { "data-testid": "responsibleOwnerName" } },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

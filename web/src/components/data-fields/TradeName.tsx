import type { ReactElement } from "react";
import {
  ProfileDataField,
  type ProfileDataFieldProps,
} from "@/components/data-fields/ProfileDataField";

export const TradeName = (props: Omit<ProfileDataFieldProps, "fieldName">): ReactElement => {
  return (
    <ProfileDataField
      fieldName="tradeName"
      inputWidth="default"
      fieldOptions={{
        slotProps: { htmlInput: { "data-testid": "tradeName" } },
      }}
      {...props}
    />
  );
};

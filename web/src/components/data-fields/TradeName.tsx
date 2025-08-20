import { ProfileDataField, ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { ReactElement } from "react";

export const TradeName = (props: Omit<ProfileDataFieldProps, "fieldName">): ReactElement => {
  return (
    <ProfileDataField
      fieldName="tradeName"
      inputWidth="default"
      fieldOptions={{
        inputProps: { "data-testid": "tradeName" },
      }}
      {...props}
    />
  );
};

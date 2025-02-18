import { DataField, DataFieldProps } from "@/components/data-fields/DataField";
import { ReactElement } from "react";

export const BusinessName = (props: Omit<DataFieldProps, "fieldName">): ReactElement => {
  return (
    <DataField
      fieldName="businessName"
      fieldOptions={{
        inputProps: { "data-testid": "businessName" },
      }}
      {...props}
      inputWidth={props.inputWidth ?? "default"}
    />
  );
};

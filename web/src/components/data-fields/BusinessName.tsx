import { DataField, DataFieldProps } from "@/components/data-fields/DataField";
import { ReactElement } from "react";

export const BusinessName = (props: Omit<DataFieldProps, "fieldName" | "inputWidth">): ReactElement<any> => {
  return (
    <DataField
      fieldName="businessName"
      fieldOptions={{
        inputProps: { "data-testid": "businessName" },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

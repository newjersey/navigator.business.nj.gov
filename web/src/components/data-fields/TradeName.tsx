import { DataField, DataFieldProps } from "@/components/data-fields/DataField";
import { ReactElement } from "react";

export const TradeName = (props: Omit<DataFieldProps, "fieldName" | "inputWidth">): ReactElement<any> => {
  return (
    <DataField
      fieldName="tradeName"
      inputWidth="default"
      fieldOptions={{
        inputProps: { "data-testid": "tradeName" },
      }}
      {...props}
    />
  );
};

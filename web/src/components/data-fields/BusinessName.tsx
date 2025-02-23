import { DataField, DataFieldProps } from "@/components/data-fields/DataField";
import { ReactElement } from "react";

type BusinessNameProps = Omit<DataFieldProps, "fieldName"> & { inputWidth?: string };

export const BusinessName = ({ inputWidth = "default", ...props }: BusinessNameProps): ReactElement => {
  return (
    <DataField
      fieldName="businessName"
      fieldOptions={{
        inputProps: { "data-testid": "businessName" },
      }}
      {...props}
      inputWidth={inputWidth ?? "default"}
    />
  );
};

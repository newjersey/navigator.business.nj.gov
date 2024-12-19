import { DataField, DataFieldProps } from "@/components/data-fields/DataField";
import { ReactElement } from "react";

export const ResponsibleOwnerName = (
  props: Omit<DataFieldProps, "fieldName" | "inputWidth">
): ReactElement<any> => {
  return (
    <DataField
      fieldName="responsibleOwnerName"
      fieldOptions={{
        inputProps: { "data-testid": "responsibleOwnerName" },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

/* eslint-disable unicorn/filename-case */

import { DataField, DataFieldProps } from "@/components/data-fields/DataField";
import { TextFieldProps } from "@mui/material";
import { ReactElement } from "react";

interface Props extends Omit<DataFieldProps, "fieldName" | "inputWidth"> {
  fieldOptions?: TextFieldProps;
}

export const NexusDBANameField = (props: Props): ReactElement<any> => {
  return (
    <DataField
      fieldName={"nexusDbaName"}
      fieldOptions={{
        inputProps: { "data-testid": "nexusDBAName" },
      }}
      inputWidth="default"
      {...props}
    />
  );
};

import { DataField } from "@/components/data-fields/DataField";
import { ReactElement } from "react";

interface Props {
  handleChangeOverride?: (value: string) => void;
}

export const Notes = (props: Props): ReactElement<any> => {
  return (
    <DataField
      inputWidth="default"
      fieldName={"notes"}
      fieldOptions={{ multiline: true, minRows: 4, inputProps: { maxLength: "500" } }}
      handleChange={props.handleChangeOverride}
    />
  );
};

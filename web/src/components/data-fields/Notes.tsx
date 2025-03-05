import { ProfileDataField } from "@/components/data-fields/ProfileDataField";
import { ReactElement } from "react";

interface Props {
  handleChangeOverride?: (value: string) => void;
}

export const Notes = (props: Props): ReactElement => {
  return (
    <ProfileDataField
      inputWidth="default"
      fieldName={"notes"}
      fieldOptions={{ multiline: true, minRows: 4, inputProps: { maxLength: "500" } }}
      handleChange={props.handleChangeOverride}
    />
  );
};

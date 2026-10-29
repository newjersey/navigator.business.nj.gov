import type { ReactElement } from "react";
import { ProfileDataField } from "@/components/data-fields/ProfileDataField";

interface Props {
  handleChangeOverride?: (value: string) => void;
}

export const Notes = (props: Props): ReactElement => {
  return (
    <ProfileDataField
      inputWidth="default"
      fieldName={"notes"}
      fieldOptions={{ multiline: true, minRows: 4, slotProps: { htmlInput: { maxLength: "500" } } }}
      handleChange={props.handleChangeOverride}
    />
  );
};

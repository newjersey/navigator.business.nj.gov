import { Checkbox } from "@mui/material";
import React, { ReactElement } from "react";

interface Props {
  id?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
  value?: unknown;
  error?: boolean;
  classNames?: string;
  name?: string;
}

export const ValidatedCheckbox = (props: Props): ReactElement => {
  return (
    <div className={props.error ? `checkbox-error-backdrop ${props.classNames}` : props.classNames ?? ""}>
      <div className={props.error ? "checkbox-error-backdrop-layer" : ""} />
      <Checkbox
        id={props.id ?? props.name}
        value={props.value}
        name={props.name}
        onChange={props.onChange}
        checked={props.checked}
        sx={{
          zIndex: 2,
          color: props.error ? "#B51D09" : "#4B7600",
          padding: 0,
        }}
      />
    </div>
  );
};

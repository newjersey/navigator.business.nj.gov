import { Checkbox } from "@mui/material";
import React from "react";

interface Props {
  id: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
  error: boolean;
}

export const ValidatedCheckbox = (props: Props) => {
  return (
    <div className={props.error ? "checkbox-error-backdrop" : ""}>
      <div className={props.error ? "checkbox-error-backdrop-layer" : ""} />
      <Checkbox
        id={props.id}
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

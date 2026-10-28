import type { ReactElement, ReactNode } from "react";
import { NumericField } from "@/components/data-fields/NumericField";

interface Props {
  children?: ReactNode;
  disabled?: boolean;
  handleChangeOverride?: (value: string) => void;
  inputWidth?: "full" | "default" | "reduced";
}

export const EntityId = (props: Props): ReactElement => {
  const fieldName = "entityId";

  return (
    <>
      <NumericField
        inputWidth={props.inputWidth ?? "default"}
        fieldName={fieldName}
        maxLength={10}
        disabled={props.disabled}
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};

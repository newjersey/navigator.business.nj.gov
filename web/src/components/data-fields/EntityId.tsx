import { NumericField } from "@/components/data-fields/NumericField";
import { ReactElement, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  disabled?: boolean;
  handleChangeOverride?: (value: string) => void;
}

export const EntityId = (props: Props): ReactElement<any> => {
  const fieldName = "entityId";

  return (
    <>
      <NumericField
        inputWidth="default"
        fieldName={fieldName}
        maxLength={10}
        disabled={props.disabled}
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};

import { NumericField } from "@/components/data-fields/NumericField";
import { ReactElement, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  onChange?: (val: string) => void;
}

export const ExistingEmployees = (props: Props): ReactElement => {
  const fieldName = "existingEmployees";

  return (
    <>
      <NumericField
        inputWidth="default"
        fieldName={fieldName}
        maxLength={7}
        minLength={1}
        onChange={props.onChange}
      />
      {props.children}
    </>
  );
};

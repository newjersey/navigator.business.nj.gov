import { NumericField } from "@/components/data-fields/NumericField";
import { ReactElement, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export const ExistingEmployees = (props: Props): ReactElement<any> => {
  const fieldName = "existingEmployees";

  return (
    <>
      <NumericField inputWidth="default" fieldName={fieldName} maxLength={7} minLength={1} />
      {props.children}
    </>
  );
};

import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ReactElement } from "react";

export const RenovationQuestion = (): ReactElement<any> => {
  return <RadioQuestion<boolean> fieldName={"plannedRenovationQuestion"} choices={[true, false]} />;
};

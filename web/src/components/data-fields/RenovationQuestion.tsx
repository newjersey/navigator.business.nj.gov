import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ReactElement } from "react";

export const RenovationQuestion = (): ReactElement => {
  return <RadioQuestion<boolean> fieldName={"plannedRenovationQuestion"} choices={[true, false]} />;
};

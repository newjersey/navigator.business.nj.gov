import type { ReactElement } from "react";
import { RadioQuestion } from "@/components/data-fields/RadioQuestion";

export const RenovationQuestion = (): ReactElement => {
  return <RadioQuestion<boolean> fieldName={"plannedRenovationQuestion"} choices={[true, false]} />;
};

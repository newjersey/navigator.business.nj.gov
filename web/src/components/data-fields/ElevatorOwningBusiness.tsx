import type { ReactElement } from "react";
import { RadioQuestion } from "@/components/data-fields/RadioQuestion";

export const ElevatorOwningBusiness = (): ReactElement => {
  return <RadioQuestion<boolean> fieldName={"elevatorOwningBusiness"} choices={[true, false]} />;
};

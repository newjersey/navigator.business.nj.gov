import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ReactElement } from "react";

export const ElevatorOwningBusiness = (): ReactElement => {
  return <RadioQuestion<boolean> fieldName={"elevatorOwningBusiness"} choices={[true, false]} />;
};

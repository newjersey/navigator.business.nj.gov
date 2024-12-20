import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ReactElement } from "react";

export const HomeBasedBusiness = (): ReactElement<any> => {
  return <RadioQuestion<boolean> fieldName={"homeBasedBusiness"} choices={[true, false]} />;
};

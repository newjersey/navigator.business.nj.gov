import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ReactElement } from "react";

export const RaffleBingoGamesQuestion = (): ReactElement => {
  return <RadioQuestion<boolean> fieldName={"raffleBingoGames"} choices={[true, false]} />;
};

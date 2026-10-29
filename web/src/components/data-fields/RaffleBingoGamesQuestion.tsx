import type { ReactElement } from "react";
import { RadioQuestion } from "@/components/data-fields/RadioQuestion";

export const RaffleBingoGamesQuestion = (): ReactElement => {
  return <RadioQuestion<boolean> fieldName={"raffleBingoGames"} choices={[true, false]} />;
};

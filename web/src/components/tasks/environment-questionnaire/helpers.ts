import { MediaArea, QuestionnaireFieldIds } from "@businessnjgovnavigator/shared/environment";

export const mediaAreaToNotApplicableOption: Record<MediaArea, QuestionnaireFieldIds> = {
  land: "noLand",
  waste: "noWaste",
  air: "noAir",
  drinkingWater: "noDrinkingWater",
  wasteWater: "noWasteWater",
};

export const stepNumberToMediaArea: Record<number, MediaArea> = {
  1: "air",
  2: "land",
  3: "waste",
  4: "drinkingWater",
  5: "wasteWater",
};

export const mediaAreaToStepNumber: Record<MediaArea, number> = {
  air: 1,
  land: 2,
  waste: 3,
  drinkingWater: 4,
  wasteWater: 5,
};

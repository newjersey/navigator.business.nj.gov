export type EnvironmentData = {
  waste?: WasteData;
};

export type WasteData = {
  questionnaireData?: WasteQuestionnaireData;
  submitted: boolean;
};

export type WasteQuestionnaireFieldIds =
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type WasteQuestionnaireData = Record<WasteQuestionnaireFieldIds, boolean>;

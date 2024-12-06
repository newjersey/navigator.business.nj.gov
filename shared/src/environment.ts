export type EnvironmentData = {
  waste?: WasteData;
  air?: AirData;
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

export type AirData = {
  questionaireData?: AirQuestionnaireData;
  submitted: boolean;
};

export type AirQuestionnaireFieldIds = "airPollutants" | "airEmissions" | "constructionActivities" | "noAir";

export type WasteQuestionnaireData = Record<WasteQuestionnaireFieldIds, boolean>;

export type AirQuestionnaireData = Record<AirQuestionnaireFieldIds, boolean>;

export type EnvironmentData = {
  waste?: WasteData;
  land?: LandData;
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

export type LandData = {
  questionnaireData?: LandQuestionnaireData;
  submitted: boolean;
};

export type LandQuestionnaireFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type LandQuestionnaireData = Record<LandQuestionnaireFieldIds, boolean>;

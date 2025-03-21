export type EnvironmentData = {
  waste?: WasteData;
  land?: LandData;
  air?: AirData;
};

export type MediaArea = keyof EnvironmentData;
export type QuestionnaireFieldIds =
  | WasteQuestionnaireFieldIds
  | LandQuestionnaireFieldIds
  | AirQuestionnaireFieldIds;
export type Questionnaire = Record<QuestionnaireFieldIds, boolean>;
export type QuestionnaireConfig = Record<QuestionnaireFieldIds, string>;

export type WasteData = {
  questionnaireData: WasteQuestionnaireData;
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
  questionnaireData: LandQuestionnaireData;
  submitted: boolean;
};

export type LandQuestionnaireFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type LandQuestionnaireData = Record<LandQuestionnaireFieldIds, boolean>;

export type AirData = {
  questionnaireData?: AirQuestionnaireData;
  submitted: boolean;
};

export type AirQuestionnaireFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type AirQuestionnaireData = Record<AirQuestionnaireFieldIds, boolean>;

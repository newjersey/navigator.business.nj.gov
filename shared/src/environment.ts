export type EnvironmentData = {
  questionnaireData?: QuestionnaireData;
  submitted?: boolean;
  sbapEmailSent?: boolean;
};

export type QuestionnaireData = {
  air: AirData;
  land: LandData;
  waste: WasteData;
  drinkingWater: DrinkingWaterData;
  wasteWater: WasteWaterData;
};

export type MediaArea = keyof QuestionnaireData;

export type QuestionnaireFieldIds =
  | AirFieldIds
  | LandFieldIds
  | WasteFieldIds
  | DrinkingWaterFieldIds
  | WasteWaterFieldIds;
export type Questionnaire = Record<QuestionnaireFieldIds, boolean>;
export type QuestionnaireConfig = Record<QuestionnaireFieldIds, string>;

export type AirFieldIds = "emitPollutants" | "emitEmissions" | "constructionActivities" | "noAir";

export type AirData = Record<AirFieldIds, boolean>;

export type LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type LandData = Record<LandFieldIds, boolean>;

export type WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type WasteData = Record<WasteFieldIds, boolean>;

export type DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type DrinkingWaterData = Record<DrinkingWaterFieldIds, boolean>;

export type WasteWaterFieldIds =
  | "sanitaryWaste"
  | "industrialWaste"
  | "localSewage"
  | "septicSystem"
  | "streamsRiversOrLakes"
  | "needsTreatment"
  | "planningConstruction"
  | "stormWaterDischarge"
  | "takeoverIndustrialStormWaterPermit"
  | "noWasteWater";

export type WasteWaterData = Record<WasteWaterFieldIds, boolean>;

export const generateEmptyEnvironmentQuestionnaireData = (): QuestionnaireData => {
  return {
    air: {
      emitPollutants: false,
      emitEmissions: false,
      constructionActivities: false,
      noAir: false,
    },
    land: {
      takeOverExistingBiz: false,
      propertyAssessment: false,
      constructionActivities: false,
      siteImprovementWasteLands: false,
      noLand: false,
    },
    waste: {
      transportWaste: false,
      hazardousMedicalWaste: false,
      compostWaste: false,
      treatProcessWaste: false,
      constructionDebris: false,
      noWaste: false,
    },
    drinkingWater: {
      ownWell: false,
      combinedWellCapacity: false,
      wellDrilled: false,
      potableWater: false,
      noDrinkingWater: false,
    },
    wasteWater: {
      sanitaryWaste: false,
      industrialWaste: false,
      localSewage: false,
      septicSystem: false,
      streamsRiversOrLakes: false,
      needsTreatment: false,
      planningConstruction: false,
      stormWaterDischarge: false,
      takeoverIndustrialStormWaterPermit: false,
      noWasteWater: false,
    },
  };
};

export type EnvironmentPermitEmailClient = {
  sendEmail: (emailMetaData: EmailMetaData) => Promise<string>;
};

export type EmailMetaData = {
  email: string;
  userName: string;
  businessName: string;
  industry: string;
  location: string;
  phase: string;
  naicsCode: string;
  questionnaireResponses: string;
};

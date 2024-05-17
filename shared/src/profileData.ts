import { CommunityAffairsAddress } from "./housing";
import { Municipality } from "./municipality";
import { OperatingPhaseId } from "./operatingPhase";

export interface ProfileDocuments {
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
}

const booleanChoice = [true, false];
export const cannabisLicenseOptions = ["CONDITIONAL", "ANNUAL"] as const;
export const carServiceOptions = ["STANDARD", "HIGH_CAPACITY", "BOTH"] as const;
export const constructionOptions = ["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"] as const;
export const residentialConstructionOptions = ["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"] as const;
export interface IndustrySpecificData {
  readonly liquorLicense: boolean;
  readonly requiresCpa: boolean;
  readonly homeBasedBusiness: boolean | undefined;
  readonly plannedRenovationQuestion: boolean | undefined;
  readonly providesStaffingService: boolean;
  readonly certifiedInteriorDesigner: boolean;
  readonly realEstateAppraisalManagement: boolean;
  readonly cannabisLicenseType: CannabisLicenseType;
  readonly cannabisMicrobusiness: boolean | undefined;
  readonly constructionRenovationPlan: boolean | undefined;
  readonly carService: CarServiceType | undefined;
  readonly interstateLogistics: boolean;
  readonly interstateMoving: boolean;
  readonly isChildcareForSixOrMore: boolean | undefined;
  readonly petCareHousing: boolean | undefined;
  readonly willSellPetCareItems: boolean | undefined;
  readonly constructionType: ConstructionType;
  readonly residentialConstructionType: ResidentialConstructionType;
}

type IndustrySpecificDataChoices = {
  [index in keyof IndustrySpecificData]: Exclude<IndustrySpecificData[index], undefined>[];
};

export const industrySpecificDataChoices: IndustrySpecificDataChoices = {
  liquorLicense: booleanChoice,
  requiresCpa: booleanChoice,
  homeBasedBusiness: booleanChoice,
  plannedRenovationQuestion: booleanChoice,
  providesStaffingService: booleanChoice,
  certifiedInteriorDesigner: booleanChoice,
  realEstateAppraisalManagement: booleanChoice,
  cannabisLicenseType: [...cannabisLicenseOptions],
  cannabisMicrobusiness: booleanChoice,
  constructionRenovationPlan: booleanChoice,
  carService: [...carServiceOptions],
  interstateLogistics: booleanChoice,
  interstateMoving: booleanChoice,
  isChildcareForSixOrMore: booleanChoice,
  petCareHousing: booleanChoice,
  willSellPetCareItems: booleanChoice,
  constructionType: [...constructionOptions],
  residentialConstructionType: [...residentialConstructionOptions],
};

export const emptyIndustrySpecificData: IndustrySpecificData = {
  liquorLicense: false,
  requiresCpa: false,
  homeBasedBusiness: undefined,
  plannedRenovationQuestion: undefined,
  cannabisLicenseType: undefined,
  cannabisMicrobusiness: undefined,
  constructionRenovationPlan: undefined,
  providesStaffingService: false,
  certifiedInteriorDesigner: false,
  realEstateAppraisalManagement: false,
  carService: undefined,
  interstateLogistics: false,
  interstateMoving: false,
  isChildcareForSixOrMore: undefined,
  petCareHousing: undefined,
  willSellPetCareItems: undefined,
  constructionType: undefined,
  residentialConstructionType: undefined,
};

export interface ProfileData extends IndustrySpecificData {
  readonly businessPersona: BusinessPersona;
  readonly businessName: string;
  readonly responsibleOwnerName: string;
  readonly tradeName: string;
  readonly industryId: string | undefined;
  readonly legalStructureId: string | undefined;
  readonly municipality: Municipality | undefined;
  readonly dateOfFormation: string | undefined;
  readonly entityId: string | undefined;
  readonly employerId: string | undefined;
  readonly taxId: string | undefined;
  readonly encryptedTaxId: string | undefined;
  readonly notes: string;
  readonly documents: ProfileDocuments;
  readonly ownershipTypeIds: string[];
  readonly existingEmployees: string | undefined;
  readonly taxPin: string | undefined;
  readonly sectorId: string | undefined;
  readonly naicsCode: string;
  readonly foreignBusinessTypeIds: ForeignBusinessTypeId[];
  readonly nexusDbaName: string;
  readonly needsNexusDbaName: boolean;
  readonly operatingPhase: OperatingPhaseId;
  readonly isNonprofitOnboardingRadio: boolean;
  readonly nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  readonly elevatorOwningBusiness: boolean | undefined;
  readonly communityAffairsAddress?: CommunityAffairsAddress;
}

export const emptyProfileData: ProfileData = {
  businessPersona: undefined,
  businessName: "",
  tradeName: "",
  responsibleOwnerName: "",
  industryId: undefined,
  legalStructureId: undefined,
  municipality: undefined,
  dateOfFormation: undefined,
  entityId: undefined,
  employerId: undefined,
  taxId: undefined,
  encryptedTaxId: undefined,
  notes: "",
  documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" },
  ownershipTypeIds: [],
  existingEmployees: undefined,
  taxPin: undefined,
  sectorId: undefined,
  naicsCode: "",
  foreignBusinessTypeIds: [],
  nexusDbaName: "",
  needsNexusDbaName: false,
  operatingPhase: "GUEST_MODE",
  isNonprofitOnboardingRadio: false,
  nonEssentialRadioAnswers: {},
  elevatorOwningBusiness: undefined,
  communityAffairsAddress: undefined,
  ...emptyIndustrySpecificData,
};

export const createEmptyProfileData = (): ProfileData => {
  return emptyProfileData;
};

export type CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type ResidentialConstructionType = "NEW_HOME_CONSTRUCTION" | "HOME_RENOVATIONS" | "BOTH" | undefined;
export const businessPersonas = ["STARTING", "OWNING", "FOREIGN"] as const;
export type BusinessPersona = (typeof businessPersonas)[number] | undefined;

export type ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

export const maskingCharacter = "*";

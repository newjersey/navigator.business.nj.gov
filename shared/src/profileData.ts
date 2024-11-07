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
export const employmentPersonnelServiceOptions = ["JOB_SEEKERS", "EMPLOYERS"] as const;
export const employmentPlacementOptions = ["TEMPORARY", "PERMANENT", "BOTH"] as const;
export const propertyLeaseTypeOptions = ["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"] as const;

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
  readonly employmentPersonnelServiceType: EmploymentAndPersonnelServicesType;
  readonly employmentPlacementType: EmploymentPlacementType;
  readonly carnivalRideOwningBusiness: boolean | undefined;
  readonly propertyLeaseType: PropertyLeaseType;
  readonly hasThreeOrMoreRentalUnits: boolean | undefined;
  readonly travelingCircusOrCarnivalOwningBusiness: boolean | undefined;
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
  employmentPersonnelServiceType: [...employmentPersonnelServiceOptions],
  employmentPlacementType: [...employmentPlacementOptions],
  carnivalRideOwningBusiness: booleanChoice,
  propertyLeaseType: [...propertyLeaseTypeOptions],
  hasThreeOrMoreRentalUnits: booleanChoice,
  travelingCircusOrCarnivalOwningBusiness: booleanChoice,
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
  employmentPersonnelServiceType: undefined,
  employmentPlacementType: undefined,
  carnivalRideOwningBusiness: undefined,
  propertyLeaseType: undefined,
  hasThreeOrMoreRentalUnits: undefined,
  travelingCircusOrCarnivalOwningBusiness: undefined,
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
  readonly raffleBingoGames: boolean | undefined;
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
  operatingPhase: OperatingPhaseId.GUEST_MODE,
  isNonprofitOnboardingRadio: false,
  nonEssentialRadioAnswers: {},
  elevatorOwningBusiness: undefined,
  communityAffairsAddress: undefined,
  raffleBingoGames: undefined,
  ...emptyIndustrySpecificData,
};

export const createEmptyProfileData = (): ProfileData => {
  return emptyProfileData;
};

export type CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type ResidentialConstructionType = "NEW_HOME_CONSTRUCTION" | "HOME_RENOVATIONS" | "BOTH" | undefined;
export type EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;
export type PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;
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

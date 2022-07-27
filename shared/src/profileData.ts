import { Municipality } from "./municipality";

export interface ProfileDocuments {
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
}

export interface ProfileData {
  readonly businessPersona: BusinessPersona;
  readonly initialOnboardingFlow: BusinessPersona;
  readonly businessName: string;
  readonly industryId: string | undefined;
  readonly legalStructureId: string | undefined;
  readonly municipality: Municipality | undefined;
  readonly liquorLicense: boolean;
  readonly requiresCpa: boolean;
  readonly homeBasedBusiness: boolean;
  readonly cannabisLicenseType: CannabisLicenseType;
  readonly cannabisMicrobusiness: boolean | undefined;
  readonly constructionRenovationPlan: boolean | undefined;
  readonly dateOfFormation: string | undefined;
  readonly entityId: string | undefined;
  readonly employerId: string | undefined;
  readonly taxId: string | undefined;
  readonly notes: string;
  readonly documents: ProfileDocuments;
  readonly ownershipTypeIds: string[];
  readonly existingEmployees: string | undefined;
  readonly taxPin: string | undefined;
  readonly sectorId: string | undefined;
  readonly naicsCode: string;
  readonly foreignBusinessType: ForeignBusinessType | undefined;
  readonly foreignBusinessTypeIds: string[];
  readonly nexusLocationInNewJersey: boolean | undefined;
  readonly nexusDbaName: string | undefined;
  readonly providesStaffingService: boolean;
  readonly certifiedInteriorDesigner: boolean;
  readonly realEstateAppraisalManagement: boolean;
  readonly operatingPhase: OperatingPhase;
}

export const emptyProfileData: ProfileData = {
  businessPersona: undefined,
  initialOnboardingFlow: undefined,
  businessName: "",
  industryId: undefined,
  legalStructureId: undefined,
  municipality: undefined,
  liquorLicense: false,
  requiresCpa: false,
  homeBasedBusiness: false,
  cannabisLicenseType: undefined,
  cannabisMicrobusiness: undefined,
  constructionRenovationPlan: undefined,
  dateOfFormation: undefined,
  entityId: undefined,
  employerId: undefined,
  taxId: undefined,
  notes: "",
  documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" },
  ownershipTypeIds: [],
  existingEmployees: undefined,
  taxPin: undefined,
  sectorId: undefined,
  naicsCode: "",
  foreignBusinessType: undefined,
  foreignBusinessTypeIds: [],
  nexusLocationInNewJersey: undefined,
  nexusDbaName: undefined,
  providesStaffingService: false,
  certifiedInteriorDesigner: false,
  realEstateAppraisalManagement: false,
  operatingPhase: "NEEDS_TO_FORM",
};

export const createEmptyProfileData = (): ProfileData => {
  return emptyProfileData;
};

export type CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;

export type BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
export type ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
export type OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | undefined;

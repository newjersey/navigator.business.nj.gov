import { Municipality } from "./municipality";
import { OperatingPhaseId } from "./operatingPhase";

export interface ProfileDocuments {
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
}

export interface ProfileData {
  readonly businessPersona: BusinessPersona;
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
  readonly carService: CarServiceType | undefined;
  readonly operatingPhase: OperatingPhaseId;
  readonly interstateTransport: boolean;
}

export const emptyProfileData: ProfileData = {
  businessPersona: undefined,
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
  carService: undefined,
  operatingPhase: "GUEST_MODE",
  interstateTransport: false,
};

export const createEmptyProfileData = (): ProfileData => {
  return emptyProfileData;
};

export type CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

export type BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
export type ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;

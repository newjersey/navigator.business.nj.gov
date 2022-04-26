import { Municipality } from "./municipality";

export interface ProfileDocuments {
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
}

export interface ProfileData {
  readonly hasExistingBusiness: boolean | undefined;
  readonly initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
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
  readonly ownershipTypeIds: readonly string[];
  readonly existingEmployees: string | undefined;
  readonly taxPin: string | undefined;
  readonly sectorId: string | undefined;
  readonly naicsCode: string;
}

export const emptyProfileData: ProfileData = {
  hasExistingBusiness: undefined,
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
};

export const createEmptyProfileData = (): ProfileData => {
  return emptyProfileData;
};

export type CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;

import { Municipality } from "./municipality";

export interface ProfileData {
  hasExistingBusiness: boolean | undefined;
  initialOnboardingFlow: "STARTING" | "OWNING" | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
}

export const emptyProfileData: ProfileData = {
  hasExistingBusiness: undefined,
  initialOnboardingFlow: undefined,
  businessName: "",
  industryId: undefined,
  legalStructureId: undefined,
  municipality: undefined,
  liquorLicense: false,
  homeBasedBusiness: false,
  cannabisLicenseType: undefined,
  constructionRenovationPlan: undefined,
  dateOfFormation: undefined,
  entityId: undefined,
  employerId: undefined,
  taxId: undefined,
  notes: "",
  ownershipTypeIds: [],
  existingEmployees: undefined,
  taxPin: undefined,
  sectorId: undefined,
};

export const createEmptyProfileData = (): ProfileData => {
  return emptyProfileData;
};

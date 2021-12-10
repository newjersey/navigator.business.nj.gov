import { Municipality } from "./municipality";

export interface ProfileData {
  hasExistingBusiness: boolean | undefined;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  certificationIds: string[];
  existingEmployees: string | undefined;
}

export const emptyProfileData: ProfileData = {
  hasExistingBusiness: undefined,
  businessName: "",
  industryId: undefined,
  legalStructureId: undefined,
  municipality: undefined,
  liquorLicense: false,
  homeBasedBusiness: false,
  constructionRenovationPlan: undefined,
  entityId: undefined,
  employerId: undefined,
  taxId: undefined,
  notes: "",
  certificationIds: [],
  existingEmployees: undefined,
};

export const createEmptyProfileData = (): ProfileData => {
  return emptyProfileData;
};

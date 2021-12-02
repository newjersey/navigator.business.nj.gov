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

export interface Certification {
  id: string;
  name: string;
}

export const LookupCertificationById = (id: string): Certification => {
  return (
    Certifications.find((x) => x.id === id) ?? {
      id: "",
      name: "",
    }
  );
};

export const Certifications: Certification[] = [
  {
    id: "minority-woman-owned",
    name: "Minority and Woman Owned Business or Enterprise (MWBE)",
  },
  {
    id: "veteran-owned",
    name: "Veteran Owned Business (VOB)",
  },
  {
    id: "disabled-veteran-owned",
    name: "Disabled Veteran-Owned Business (DVOB)",
  },
  {
    id: "small-business-enterprise",
    name: "Small Business Enterprise (SBE)",
  },
  {
    id: "emerging-small-business-enterprise",
    name: "Emerging Small Business Enterprise (ESBE)",
  },
  {
    id: "disadvantaged-business-enterprise",
    name: "Disadvantaged Business Enterprise (DBE)",
  },
  {
    id: "service-disabled-veteran-owned",
    name: "Service Disabled Veteran Owned Small Business (SDVOSB)",
  },
];

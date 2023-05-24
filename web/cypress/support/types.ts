import { FormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { Industry } from "@businessnjgovnavigator/shared/industry";
import { CarServiceType } from "@businessnjgovnavigator/shared/profileData";

export interface LighthouseThresholds {
  accessibility: number;
  "best-practices": number;
  performance: number;
  seo: number;
  pwa: number;
}

export interface LighthouseConfig {
  formFactor: "desktop" | "mobile";
  screenEmulation?: {
    disabled: boolean;
  };
}

export interface Pa11yThresholds {
  ignore?: string[];
  runners?: string[];
}

export type Registration = {
  fullName: string;
  email: string;
  isNewsletterChecked: boolean;
  isContactMeChecked: boolean;
};

export interface StartingOnboardingData {
  industry: Industry | undefined;
  legalStructureId: string | undefined;
  townDisplayName: string | undefined;
  homeBasedQuestion: boolean | undefined;
  liquorLicenseQuestion: boolean | undefined;
  requiresCpa: boolean | undefined;
  providesStaffingService: boolean | undefined;
  certifiedInteriorDesigner: boolean | undefined;
  realEstateAppraisalManagement: boolean | undefined;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  carService: CarServiceType | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

export interface ExistingOnboardingData {
  businessFormationDate?: string;
  businessName?: string;
  sectorId?: string;
  legalStructureId?: string;
  numberOfEmployees?: string;
  townDisplayName?: string;
  homeBasedQuestion?: boolean;
  ownershipDataValues?: string[];
}

export interface ForeignOnboardingData {
  foreignBusinessTypeIds: string[];
  locationInNewJersey: boolean;
}

export interface StartingProfileData extends StartingOnboardingData {
  employerId: string;
  taxId: string;
  notes: string;
  entityId: string;
}

export interface ExistingProfileData extends ExistingOnboardingData {
  employerId: string;
  taxId: string;
  notes: string;
  entityId: string;
  taxPin: string;
}

export interface ForeignProfileData {
  taxId: string;
  notes: string;
}

export interface AdditionalFormation extends Partial<FormationFormData> {
  registeredAgentSameAsAccountCheckbox: boolean;
  getRegisteredAgentSameAsBusinessAddressCheckbox: boolean;
}

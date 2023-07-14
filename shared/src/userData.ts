import { Business, createEmptyBusiness, generateBusinessId } from "./business";
import { BusinessUser } from "./businessUser";
import { createEmptyFormationFormData, FormationData } from "./formationData";
import { LicenseData } from "./license";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { TaxFilingData } from "./taxFiling";

export interface UserData {
  readonly user: BusinessUser;
  readonly businesses: Record<string, Business>;
  version: number;
  versionWhenCreated: number;
  currentBusinessId: string;
  lastUpdatedISO: string | undefined;
  dateCreatedISO: string | undefined;
}

export type LegacyUserDataOverrides = {
  profileData?: ProfileData;
  formationData?: FormationData;
  user?: BusinessUser;
  onboardingFormProgress?: Partial<OnboardingFormProgress>;
  taskProgress?: Record<string, TaskProgress>;
  taskItemChecklist?: Record<string, boolean>;
  taxFilingData?: TaxFilingData;
  licenseData?: LicenseData;
  preferences?: Preferences;
  version?: number;
  lastUpdatedISO?: string;
  dateCreatedISO?: string;
  versionWhenCreated?: number;
};

export const CURRENT_VERSION = 118;
export const createEmptyUserData = (user: BusinessUser): UserData => {
  const businessId = generateBusinessId();
  return {
    version: CURRENT_VERSION,
    user: user,
    businesses: { abc: createEmptyBusiness(businessId) },
    versionWhenCreated: CURRENT_VERSION,
    currentBusinessId: businessId,
    lastUpdatedISO: undefined,
    dateCreatedISO: undefined,
  };
};

export const sectionNames = ["PLAN", "START"] as const;
export type SectionType = (typeof sectionNames)[number];

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  returnToLink: string;
  isCalendarFullView: boolean;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
}

export type OnboardingFormProgress = "UNSTARTED" | "COMPLETED";

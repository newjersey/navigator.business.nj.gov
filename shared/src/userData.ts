import {
  Business,
  createEmptyBusiness,
  generateBusinessId,
} from "./business";
import { BusinessUser } from "./businessUser";
import { createEmptyFormationFormData, FormationData } from "./formationData";
import { LicenseData } from "./license";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { TaxFilingData } from "./taxFiling";

export interface UserData {
  readonly user: BusinessUser;
  readonly profileData: ProfileData;
  readonly onboardingFormProgress: OnboardingFormProgress;
  readonly taskProgress: Record<string, TaskProgress>;
  readonly taskItemChecklist: Record<string, boolean>;
  readonly licenseData: LicenseData | undefined;
  readonly preferences: Preferences;
  readonly taxFilingData: TaxFilingData;
  readonly formationData: FormationData;
  readonly version: number;
  readonly lastUpdatedISO: string | undefined;
  dateCreatedISO: string | undefined;
  versionWhenCreated: number;
}

export interface UserDataPrime {
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
  return {
    version: CURRENT_VERSION,
    user: user,
    profileData: createEmptyProfileData(),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    lastUpdatedISO: undefined,
    dateCreatedISO: undefined,
    versionWhenCreated: CURRENT_VERSION,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleSidebarCards: ["welcome"],
      returnToLink: "",
      isCalendarFullView: false,
      isHideableRoadmapOpen: false,
      phaseNewlyChanged: true,
    },
    taxFilingData: {
      state: undefined,
      businessName: undefined,
      lastUpdatedISO: undefined,
      registeredISO: undefined,
      filings: [],
    },
    formationData: {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    },
  };
};

export const createEmptyUserDataPrime = (user: BusinessUser): UserDataPrime => {
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

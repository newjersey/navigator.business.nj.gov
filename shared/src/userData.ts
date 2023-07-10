import { BusinessUser } from "./businessUser";
import { createEmptyFormationFormData, FormationData } from "./formationData";
import { LicenseData } from "./license";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { TaxFilingData } from "./taxFiling";

export interface UserData {
  readonly user: BusinessUser;
  readonly businesses: Record<string, Business>
  version: number;
  versionWhenCreated: number;
  currentBusinessID: string;
}

/**
 * export interface UserData {
 *   readonly user: BusinessUser;
 *   readonly profileData: ProfileData;
 *   readonly onboardingFormProgress: OnboardingFormProgress;
 *   readonly taskProgress: Record<string, TaskProgress>;
 *   readonly taskItemChecklist: Record<string, boolean>;
 *   readonly licenseData: LicenseData | undefined;
 *   readonly preferences: Preferences;
 *   readonly taxFilingData: TaxFilingData;
 *   readonly formationData: FormationData;
 *   readonly version: number;
 *   readonly lastUpdatedISO: string | undefined;
 *   dateCreatedISO: string | undefined;
 *   versionWhenCreated: number;
 * }
 *
 * export interface UserDataPrime {
 *   readonly user: BusinessUser;
 *   readonly businesses: Record<string, Business>
 *   version: number;
 *   versionWhenCreated: number;
 *   currentBusinessID: string;
 * }
 *
 *
 */

export const CURRENT_VERSION = 119;

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    version: CURRENT_VERSION,
    user: user,
    businesses: {"abc" : createEmptyBusiness()},
    versionWhenCreated: CURRENT_VERSION,
    currentBusinessID: "abc"
  }
};

export const createEmptyBusiness = (): Business => {
  return {
    profileData: createEmptyProfileData(),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    dateLastUpdatedISO: undefined,
    dateCreatedISO: undefined,
    taxFilingData:
      {
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
    id: ""
  }
}

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

export interface Business {
  id: string;
  dateCreatedISO: string | undefined;
  dateLastUpdatedISO: string | undefined;
  profileData: ProfileData;
  onboardingFormProgress: OnboardingFormProgress;
  taskProgress: Record<string, TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: LicenseData | undefined;
  preferences: Preferences;
  taxFilingData: TaxFilingData;
  formationData: FormationData;
}

export type OnboardingFormProgress = "UNSTARTED" | "COMPLETED";

export const sectionNames = ["PLAN", "START"] as const;
export type SectionType = (typeof sectionNames)[number];

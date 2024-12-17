import { BusinessUser } from "./businessUser";
import { createBusinessId } from "./domain-logic/createBusinessId";
import { EnvironmentData } from "./environment";
import { createEmptyFormationFormData, FormationData } from "./formationData";
import { LicenseData } from "./license";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { TaxFilingData } from "./taxFiling";

export interface UserData {
  readonly user: BusinessUser;
  readonly version: number;
  readonly lastUpdatedISO: string;
  readonly dateCreatedISO: string;
  readonly versionWhenCreated: number;
  businesses: Record<string, Business>;
  currentBusinessId: string;
}

export interface Business {
  readonly id: string;
  readonly dateCreatedISO: string;
  readonly lastUpdatedISO: string;
  readonly profileData: ProfileData;
  readonly onboardingFormProgress: OnboardingFormProgress;
  readonly taskProgress: Record<string, TaskProgress>;
  readonly taskItemChecklist: Record<string, boolean>;
  readonly licenseData: LicenseData | undefined;
  readonly preferences: Preferences;
  readonly taxFilingData: TaxFilingData;
  readonly formationData: FormationData;
  readonly environmentData: EnvironmentData | undefined;
  readonly version: number;
}

export const CURRENT_VERSION = 152;

export const createEmptyBusiness = (id?: string): Business => {
  return {
    id: id || createBusinessId(),
    dateCreatedISO: new Date(Date.now()).toISOString(),
    lastUpdatedISO: new Date(Date.now()).toISOString(),
    profileData: createEmptyProfileData(),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleSidebarCards: [],
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
    environmentData: undefined,
    version: CURRENT_VERSION,
  };
};

export const createEmptyUserData = (user: BusinessUser): UserData => {
  const businessId = createBusinessId();
  return {
    version: CURRENT_VERSION,
    user: user,
    lastUpdatedISO: new Date(Date.now()).toISOString(),
    dateCreatedISO: new Date(Date.now()).toISOString(),
    versionWhenCreated: CURRENT_VERSION,
    currentBusinessId: businessId,
    businesses: {
      [businessId]: createEmptyBusiness(businessId),
    },
  };
};

export const sectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
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

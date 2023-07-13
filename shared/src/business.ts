import { createEmptyFormationFormData, FormationData } from "./formationData";
import { LicenseData } from "./license";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { TaxFilingData } from "./taxFiling";
import { randomInt } from "./intHelpers";

export interface Business {
  id: string;
  dateCreatedISO: string | undefined;
  lastUpdatedISO: string | undefined;
  profileData: ProfileData;
  onboardingFormProgress: OnboardingFormProgress;
  taskProgress: Record<string, TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: LicenseData | undefined;
  preferences: Preferences;
  taxFilingData: TaxFilingData;
  formationData: FormationData;
}

export const generateBusinessId = (): string => {
  return `some-Id-${randomInt()}`;
}

export const createEmptyBusiness = (id?: string): Business => {
  return {
    profileData: createEmptyProfileData(),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    lastUpdatedISO: undefined,
    dateCreatedISO: undefined,
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
    id: id ?? generateBusinessId(),
  };
};

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

export const sectionNames = ["PLAN", "START"] as const;
export type SectionType = (typeof sectionNames)[number];

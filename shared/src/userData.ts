import { BusinessUser } from "./businessUser";
import { createEmptyFormationFormData, FormationData } from "./formationData";
import { LicenseData } from "./license";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { TaxFilingData } from "./taxFiling";

export interface UserData {
  readonly user: BusinessUser;
  readonly profileData: ProfileData;
  readonly formProgress: FormProgress;
  readonly taskProgress: Record<string, TaskProgress>;
  readonly taskItemChecklist: Record<string, boolean>;
  readonly licenseData: LicenseData | undefined;
  readonly preferences: Preferences;
  readonly taxFilingData: TaxFilingData;
  readonly formationData: FormationData;
}

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    profileData: createEmptyProfileData(),
    formProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleSidebarCards: ["welcome"],
      returnToLink: "",
      isCalendarFullView: true,
      isHideableRoadmapOpen: false,
    },
    taxFilingData: {
      state: undefined,
      businessName: undefined,
      lastUpdatedISO: undefined,
      registered: false,
      filings: [],
    },
    formationData: {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    },
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
}

export type FormProgress = "UNSTARTED" | "COMPLETED";

export const sectionNames = ["PLAN", "START"] as const;
export type SectionType = typeof sectionNames[number];

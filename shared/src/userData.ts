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
      visibleRoadmapSidebarCards: ["welcome", "task-progress", "graduation"],
    },
    taxFilingData: {
      filings: [],
    },
    formationData: {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
    },
  };
};

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleRoadmapSidebarCards: string[];
}

export type FormProgress = "UNSTARTED" | "COMPLETED";

export type SectionType = "PLAN" | "START" | "OPERATE";

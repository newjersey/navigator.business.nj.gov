import { BusinessUser } from "./businessUser";
import { createEmptyFormationFormData, FormationData } from "./formationData";
import { LicenseData } from "./license";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { TaxFilingData } from "./taxFiling";

export interface UserData {
  user: BusinessUser;
  profileData: ProfileData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: LicenseData | undefined;
  preferences: Preferences;
  taxFilingData: TaxFilingData;
  formationData: FormationData;
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
}

export type FormProgress = "UNSTARTED" | "COMPLETED";

export type SectionType = "PLAN" | "START" | "OPERATE";

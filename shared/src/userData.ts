import { BusinessUser } from "./businessUser";
import { FormationData } from "./formationData";
import { LicenseData } from "./license";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { TaxFilingData } from "./taxFiling";

export interface UserData {
  user: BusinessUser;
  profileData: ProfileData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
  licenseData: LicenseData | undefined;
  preferences: Preferences;
  taxFilingData: TaxFilingData;
  formationData: FormationData | undefined;
}

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    profileData: createEmptyProfileData(),
    formProgress: "UNSTARTED",
    taskProgress: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
    },
    taxFilingData: {
      entityIdStatus: "UNKNOWN",
      filings: [],
    },
    formationData: undefined,
  };
};

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
}

export type FormProgress = "UNSTARTED" | "COMPLETED";

export type SectionType = "PLAN" | "START" | "OPERATE";

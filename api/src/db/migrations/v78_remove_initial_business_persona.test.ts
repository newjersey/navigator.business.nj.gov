import {
  generatev77FormationFormData,
  generatev77ProfileData,
  generatev77User,
  v77ProfileData,
  v77UserData,
} from "@db/migrations/v77_remove_graduation_card";
import { migrate_v77_to_v78 } from "@db/migrations/v78_remove_initial_business_persona";

describe("migrate_v77_to_v78", () => {
  it("updates the value of businessPersona to match initialOnboardingFlow", () => {
    const v77 = makeUserData({ initialOnboardingFlow: "STARTING", businessPersona: "OWNING" });

    const v78 = migrate_v77_to_v78(v77);

    expect(v78.profileData.businessPersona).toEqual("STARTING");
  });
});

const makeUserData = (profileData: Partial<v77ProfileData>): v77UserData => {
  return {
    user: generatev77User({}),
    profileData: generatev77ProfileData({ ...profileData }),
    formProgress: "COMPLETED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleRoadmapSidebarCards: [],
    },
    taxFilingData: {
      filings: [],
    },
    formationData: {
      formationFormData: generatev77FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined,
    },
    version: 76,
  };
};

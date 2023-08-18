import {
  generatev76FormationFormData,
  generatev76ProfileData,
  generatev76User,
  v76Preferences,
  v76UserData
} from "./v76_fix_trade_name_operating_phase_round_2";
import { migrate_v76_to_v77 } from "./v77_remove_graduation_card";

describe("migrate_v76_to_v77", () => {
  it("removes the graduation card from visibleRoadmapSidebarCards", () => {
    const v76 = makeUserData({ visibleRoadmapSidebarCards: ["graduation", "other-card"] });

    const v77 = migrate_v76_to_v77(v76);

    expect(v77.preferences.visibleRoadmapSidebarCards).toEqual(["other-card"]);
  });
});

const makeUserData = (preferences: Partial<v76Preferences>): v76UserData => {
  return {
    user: generatev76User({}),
    profileData: generatev76ProfileData({}),
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
      ...preferences
    },
    taxFilingData: {
      filings: []
    },
    formationData: {
      formationFormData: generatev76FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined
    },
    version: 76
  };
};

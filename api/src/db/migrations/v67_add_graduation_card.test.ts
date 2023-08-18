import {
  generatev66FormationFormData,
  generatev66ProfileData,
  generatev66User,
  v66ProfileData,
  v66UserData
} from "./v66_add_nexus_to_profile";
import { migrate_v66_to_v67 } from "./v67_add_graduation_card";

describe("migrate_v66_to_v67", () => {
  it("adds graduation card to visibleRoadmapSidebarCards when business persona is STARTING", () => {
    const profileData = generatev66ProfileData({ businessPersona: "STARTING" });
    const v66 = makeUserData(profileData);
    const v67 = migrate_v66_to_v67(v66);

    expect(v67.preferences.visibleRoadmapSidebarCards).toEqual(expect.arrayContaining(["graduation"]));
  });

  it("adds graduation card to visibleRoadmapSidebarCards when business persona is OWNING", () => {
    const profileData = generatev66ProfileData({ businessPersona: "OWNING" });
    const v66 = makeUserData(profileData);
    const v67 = migrate_v66_to_v67(v66);

    expect(v67.preferences.visibleRoadmapSidebarCards).toEqual(expect.arrayContaining(["graduation"]));
  });

  it("does not add graduation card to visibleRoadmapSidebarCards when business persona is FOREIGN", () => {
    const profileData = generatev66ProfileData({ businessPersona: "FOREIGN" });
    const v66 = makeUserData(profileData);
    const v67 = migrate_v66_to_v67(v66);

    expect(v67.preferences.visibleRoadmapSidebarCards).toEqual(expect.arrayContaining([]));
  });
});

const makeUserData = (profileData: v66ProfileData): v66UserData => {
  return {
    user: generatev66User({}),
    profileData,
    formProgress: "COMPLETED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleRoadmapSidebarCards: []
    },
    taxFilingData: {
      filings: []
    },
    formationData: {
      formationFormData: generatev66FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined
    },
    version: 66
  };
};

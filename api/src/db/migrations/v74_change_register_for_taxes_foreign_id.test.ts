import {
  generatev73FormationFormData,
  generatev73ProfileData,
  generatev73User,
  v73ProfileData,
  v73TaskProgress,
  v73UserData,
} from "./v73_add_operating_status_field";
import { migrate_v73_to_v74 } from "./v74_change_register_for_taxes_foreign_id";

describe("migrate_v73_to_v74", () => {
  it("sets register-for-taxes status to register-for-taxes-foreign for nexus users", () => {
    const profileData = generatev73ProfileData({
      businessPersona: "FOREIGN",
      foreignBusinessType: "NEXUS",
    });
    const taskProgress = {
      "register-for-taxes-foreign": "IN_PROGRESS",
    } as Record<string, v73TaskProgress>;
    const v73 = makeUserData(profileData, taskProgress);
    const v74 = migrate_v73_to_v74(v73);

    expect(v74.taskProgress).toEqual({
      "register-for-taxes": "IN_PROGRESS",
    });
  });
});

const makeUserData = (
  profileData: v73ProfileData,
  taskProgress: Record<string, v73TaskProgress>,
): v73UserData => {
  return {
    user: generatev73User({}),
    profileData,
    formProgress: "COMPLETED",
    taskProgress: taskProgress,
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
      formationFormData: generatev73FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined,
    },
    version: 73,
  };
};

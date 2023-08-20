import {
  generatev68FormationFormData,
  generatev68ProfileData,
  generatev68User,
  v68ProfileData,
  v68TaskProgress,
  v68UserData,
} from "./v68_complete_formation_task_if_success";
import { migrate_v68_to_v69 } from "./v69_change_form_business_entity_foreign_id";

describe("migrate_v68_to_v69", () => {
  it("sets form-business-entity status to form-business-entity-foreign for nexus users", () => {
    const profileData = generatev68ProfileData({
      businessPersona: "FOREIGN",
      foreignBusinessType: "NEXUS",
    });
    const taskProgress = {
      "form-business-entity-foreign": "IN_PROGRESS",
    } as Record<string, v68TaskProgress>;
    const v68 = makeUserData(profileData, taskProgress);
    const v69 = migrate_v68_to_v69(v68);

    expect(v69.taskProgress).toEqual({
      "form-business-entity": "IN_PROGRESS",
    });
  });
});

const makeUserData = (
  profileData: v68ProfileData,
  taskProgress: Record<string, v68TaskProgress>
): v68UserData => {
  return {
    user: generatev68User({}),
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
      formationFormData: generatev68FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined,
    },
    version: 67,
  };
};

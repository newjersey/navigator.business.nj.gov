import {
  generatev67FormationFormData,
  generatev67GetFilingResponse,
  generatev67ProfileData,
  generatev67User,
  v67GetFilingResponse,
  v67ProfileData,
  v67TaskProgress,
  v67UserData
} from "./v67_add_graduation_card";
import { migrate_v67_to_v68 } from "./v68_complete_formation_task_if_success";

describe("migrate_v67_to_v68", () => {
  it("sets formation task status to complete if API filing is success", () => {
    const profileData = generatev67ProfileData({});
    const getFilingResponse = generatev67GetFilingResponse({ success: true });
    const taskProgress = {
      "form-business-entity": "IN_PROGRESS",
      "other-task": "NOT_STARTED"
    } as Record<string, v67TaskProgress>;
    const v67 = makeUserData(profileData, getFilingResponse, taskProgress);
    const v68 = migrate_v67_to_v68(v67);

    expect(v68.taskProgress).toEqual({
      "form-business-entity": "COMPLETED",
      "other-task": "NOT_STARTED"
    });
  });

  it("does not change formation task status to complete if API filing is not success", () => {
    const profileData = generatev67ProfileData({});
    const getFilingResponse = generatev67GetFilingResponse({ success: false });
    const taskProgress = {
      "form-business-entity": "IN_PROGRESS",
      "other-task": "NOT_STARTED"
    } as Record<string, v67TaskProgress>;
    const v67 = makeUserData(profileData, getFilingResponse, taskProgress);
    const v68 = migrate_v67_to_v68(v67);

    expect(v68.taskProgress).toEqual({
      "form-business-entity": "IN_PROGRESS",
      "other-task": "NOT_STARTED"
    });
  });
});

const makeUserData = (
  profileData: v67ProfileData,
  getFilingResponse: v67GetFilingResponse,
  taskProgress: Record<string, v67TaskProgress>
): v67UserData => {
  return {
    user: generatev67User({}),
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
      visibleRoadmapSidebarCards: []
    },
    taxFilingData: {
      filings: []
    },
    formationData: {
      formationFormData: generatev67FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: getFilingResponse
    },
    version: 67
  };
};

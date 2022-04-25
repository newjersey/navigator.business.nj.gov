import { generatev42FormationFormData } from "./v42_add_sector_to_profile_data";
import {
  generatev49ProfileData,
  generatev49User,
  v49ProfileData,
  v49UserData,
} from "./v49_add_cannabis_microbusiness";
import { migrate_v49_to_v50 } from "./v50_fix_annual_conditional_ids";

describe("migrate_v49_to_v50", () => {
  const user = generatev49User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("changes conditional to annual task progress when user is annual cannabis", () => {
    const profileData = generatev49ProfileData({
      industryId: "cannabis",
      cannabisLicenseType: "ANNUAL",
    });
    const v49 = makeUserData(profileData, {
      taskProgress: {
        "conditional-permit-cannabis": "IN_PROGRESS",
        "another-task": "COMPLETED",
      },
    });
    const v50 = migrate_v49_to_v50(v49);

    expect(v50.taskProgress).toEqual({
      "annual-license-cannabis": "IN_PROGRESS",
      "conditional-permit-cannabis": "NOT_STARTED",
      "another-task": "COMPLETED",
    });
  });

  it("keeps task progress when user is conditional cannabis", () => {
    const profileData = generatev49ProfileData({
      industryId: "cannabis",
      cannabisLicenseType: "CONDITIONAL",
    });
    const v49 = makeUserData(profileData, {
      taskProgress: {
        "conditional-permit-cannabis": "IN_PROGRESS",
        "another-task": "COMPLETED",
      },
    });
    const v50 = migrate_v49_to_v50(v49);

    expect(v50.taskProgress).toEqual({
      "conditional-permit-cannabis": "IN_PROGRESS",
      "another-task": "COMPLETED",
    });
  });

  const makeUserData = (profileData: v49ProfileData, overrides: Partial<v49UserData>): v49UserData => {
    return {
      user,
      profileData,
      formProgress,
      taskProgress,
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
      taskItemChecklist: {},
      formationData: {
        formationFormData: generatev42FormationFormData({}),
        formationResponse: undefined,
        getFilingResponse: undefined,
      },
      version: 49,
      ...overrides,
    };
  };
});

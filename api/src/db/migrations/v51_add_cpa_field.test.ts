import {
  generatev50FormationFormData,
  generatev50ProfileData,
  generatev50User,
  v50ProfileData,
  v50UserData,
} from "./v50_fix_annual_conditional_ids";
import { migrate_v50_to_v51 } from "./v51_add_cpa_field";

describe("migrate_v50_to_v51", () => {
  const user = generatev50User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("sets requires cpa to false when industry is not certified-public-accountant", () => {
    const profileData = generatev50ProfileData({
      industryId: "auto-body-repair",
    });
    const v50 = makeUserData(profileData);
    const v51 = migrate_v50_to_v51(v50);

    expect(v51.profileData.requiresCpa).toBe(false);
  });

  it("sets requires cpa to true when industry is certified-public-accountant", () => {
    const profileData = generatev50ProfileData({
      industryId: "certified-public-accountant",
    });
    const v50 = makeUserData(profileData);
    const v51 = migrate_v50_to_v51(v50);

    expect(v51.profileData.requiresCpa).toBe(true);
  });

  const makeUserData = (profileData: v50ProfileData): v50UserData => {
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
      taskItemChecklist: {},
      taxFilingData: {
        filings: [],
      },
      formationData: {
        formationFormData: generatev50FormationFormData({}),
        formationResponse: undefined,
        getFilingResponse: undefined,
      },
      version: 50,
    };
  };
});

import { generatev50FormationFormData, generatev50User } from "./v50_fix_annual_conditional_ids";
import { generatev52ProfileData, v52ProfileData, v52UserData } from "./v52_add_naics_code";
import { migrate_v52_to_v53 } from "./v53_migrate_cannabis_dvob";

describe("migrate_v52_to_v53", () => {
  const user = generatev50User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("changes general-veteran-owned checklist item to general-dvob", () => {
    const profileData = generatev52ProfileData({});
    const v52 = makeUserData(profileData);
    v52.taskItemChecklist = {
      "general-veteran-owned": true,
      "something-else": true
    };
    const v53 = migrate_v52_to_v53(v52);

    expect(v53.taskItemChecklist["general-veteran-owned"]).toBeUndefined();
    expect(v53.taskItemChecklist["general-dvob"]).toBe(true);
    expect(v53.taskItemChecklist["something-else"]).toBe(true);
  });

  const makeUserData = (profileData: v52ProfileData): v52UserData => {
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
        hiddenFundingIds: []
      },
      taskItemChecklist: {},
      taxFilingData: {
        filings: []
      },
      formationData: {
        formationFormData: generatev50FormationFormData({}),
        formationResponse: undefined,
        getFilingResponse: undefined
      },
      version: 53
    };
  };
});

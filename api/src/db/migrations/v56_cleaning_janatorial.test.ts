import {
  generatev55FormationFormData,
  generatev55ProfileData,
  generatev55User,
  v55ProfileData,
  v55UserData,
} from "@db/migrations/v55_marketing_and_pr";
import { migrate_v55_to_v56 } from "@db/migrations/v56_cleaning_janatorial";

describe("migrate_v55_to_v56", () => {
  const user = generatev55User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("does not change auto-body-repair", () => {
    const profileData = generatev55ProfileData({ industryId: "auto-body-repair" });
    const v55 = makeUserData(profileData);
    const v56 = migrate_v55_to_v56(v55);

    expect(v56.profileData.industryId).toBe("auto-body-repair");
  });

  it("changes janitorial-services to cleaning-janitorial-services", () => {
    const profileData = generatev55ProfileData({ industryId: "janitorial-services" });
    const v55 = makeUserData(profileData);
    const v56 = migrate_v55_to_v56(v55);

    expect(v56.profileData.industryId).toBe("cleaning-janitorial-services");
  });

  it("changes cleaning-aid to cleaning-janitorial-services", () => {
    const profileData = generatev55ProfileData({ industryId: "cleaning-aid" });
    const v55 = makeUserData(profileData);
    const v56 = migrate_v55_to_v56(v55);

    expect(v56.profileData.industryId).toBe("cleaning-janitorial-services");
  });

  const makeUserData = (profileData: v55ProfileData): v55UserData => {
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
        formationFormData: generatev55FormationFormData({}),
        formationResponse: undefined,
        getFilingResponse: undefined,
      },
      version: 53,
    };
  };
});

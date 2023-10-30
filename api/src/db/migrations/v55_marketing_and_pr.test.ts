import {
  generatev54FormationFormData,
  generatev54ProfileData,
  generatev54User,
  v54ProfileData,
  v54UserData,
} from "@db/migrations/v54_add_business_purpose";
import { migrate_v54_to_v55 } from "@db/migrations/v55_marketing_and_pr";

describe("migrate_v54_to_v55", () => {
  const user = generatev54User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("does not change auto-body-repair", () => {
    const profileData = generatev54ProfileData({ industryId: "auto-body-repair" });
    const v54 = makeUserData(profileData);
    const v55 = migrate_v54_to_v55(v54);

    expect(v55.profileData.industryId).toBe("auto-body-repair");
  });

  it("changes marketing-consulting to marketing-pr-consulting", () => {
    const profileData = generatev54ProfileData({ industryId: "marketing-consulting" });
    const v54 = makeUserData(profileData);
    const v55 = migrate_v54_to_v55(v54);

    expect(v55.profileData.industryId).toBe("marketing-pr-consulting");
  });

  it("changes pr-consultant to marketing-pr-consulting", () => {
    const profileData = generatev54ProfileData({ industryId: "pr-consultant" });
    const v54 = makeUserData(profileData);
    const v55 = migrate_v54_to_v55(v54);

    expect(v55.profileData.industryId).toBe("marketing-pr-consulting");
  });

  const makeUserData = (profileData: v54ProfileData): v54UserData => {
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
        formationFormData: generatev54FormationFormData({}),
        formationResponse: undefined,
        getFilingResponse: undefined,
      },
      version: 53,
    };
  };
});

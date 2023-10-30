import {
  generatev61FormationFormData,
  generatev61ProfileData,
  generatev61User,
  v61ProfileData,
  v61UserData,
} from "@db/migrations/v61_add_corp_formation";
import { migrate_v61_to_v62 } from "@db/migrations/v62_rename_has_existing_business";

describe("migrate_v61_to_v62", () => {
  const user = generatev61User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("sets businessPersona to OWNING when hasExistingBusiness is true", () => {
    const profileData = generatev61ProfileData({ hasExistingBusiness: true });
    const v61 = makeUserData(profileData);
    const v62 = migrate_v61_to_v62(v61);

    expect(v62.profileData.businessPersona).toBe("OWNING");
  });

  it("sets businessPersona to STARTING when hasExistingBusiness is false", () => {
    const profileData = generatev61ProfileData({ hasExistingBusiness: false });
    const v61 = makeUserData(profileData);
    const v62 = migrate_v61_to_v62(v61);

    expect(v62.profileData.businessPersona).toBe("STARTING");
  });

  const makeUserData = (profileData: v61ProfileData): v61UserData => {
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
        visibleRoadmapSidebarCards: [],
      },
      taskItemChecklist: {},
      taxFilingData: {
        filings: [],
      },
      formationData: {
        formationFormData: generatev61FormationFormData({}),
        formationResponse: undefined,
        getFilingResponse: undefined,
      },
      version: 53,
    };
  };
});

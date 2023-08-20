import {
  generatev42FormationFormData,
  generatev42ProfileData,
  generatev42User,
  v42ProfileData,
  v42UserData,
} from "./v42_add_sector_to_profile_data";
import { migrate_v42_to_v43 } from "./v43_add_initial_flow_to_profile_data";

describe("migrate_v42_to_v43", () => {
  const user = generatev42User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("adds starting as initial flow if hasExistingBusiness is false", () => {
    const profileData = generatev42ProfileData({
      hasExistingBusiness: false,
    });
    const v42 = makeUserData(profileData);
    const v43 = migrate_v42_to_v43(v42);

    expect(v43.profileData.initialOnboardingFlow).toEqual("STARTING");
  });

  it("adds owning as initial flow if hasExistingBusiness is true", () => {
    const profileData = generatev42ProfileData({
      hasExistingBusiness: true,
    });
    const v42 = makeUserData(profileData);
    const v43 = migrate_v42_to_v43(v42);

    expect(v43.profileData.initialOnboardingFlow).toEqual("OWNING");
  });

  it("adds undefined as initial flow if hasExistingBusiness is undefined", () => {
    const profileData = generatev42ProfileData({
      hasExistingBusiness: undefined,
    });
    const v42 = makeUserData(profileData);
    const v43 = migrate_v42_to_v43(v42);

    expect(v43.profileData.initialOnboardingFlow).toBeUndefined();
  });

  const makeUserData = (profileData: v42ProfileData): v42UserData => {
    return {
      user,
      profileData,
      formProgress,
      taskProgress,
      licenseData: undefined,
      preferences: {
        roadmapOpenSections: ["PLAN", "START"],
        roadmapOpenSteps: [],
      },
      taxFilingData: {
        filings: [],
      },
      formationData: {
        formationFormData: generatev42FormationFormData({}),
        formationResponse: undefined,
        getFilingResponse: undefined,
      },
      version: 42,
    };
  };
});

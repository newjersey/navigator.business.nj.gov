import { generatev22OnboardingData, generatev22User, v22UserData } from "./v22_switch_legal_structure_to_id";
import { migrate_v22_to_v23 } from "./v23_rename_onboardingData_to_profileData";

describe("migrate_v22_to_v23", () => {
  const user = generatev22User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("turns onboardingData into profileData", () => {
    const onboardingData = generatev22OnboardingData({});
    const v22: v22UserData = {
      user,
      onboardingData,
      formProgress,
      taskProgress,
      licenseData: undefined,
      preferences: {
        roadmapOpenSections: ["PLAN", "START"],
        roadmapOpenSteps: [],
      },
      taxFilings: [],
      version: 22,
    };

    expect(v22.onboardingData.businessName).toBeDefined;

    const v23 = migrate_v22_to_v23(v22);

    expect(v23.profileData.businessName).toBeDefined;
    expect(v23).not.toContain("onboardingData");
  });
});

import { generatev19OnboardingData, generatev19User, v19UserData } from "./v19_add_employment_agency_roadmap";
import { migrate_v19_to_v20 } from "./v20_switch_industry_to_id";

describe("migrate_v19_to_v20", () => {
  const user = generatev19User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("turns industry into industryId", () => {
    const onboardingData = generatev19OnboardingData({ industry: "restaurant" });
    const v19: v19UserData = {
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
      version: 19,
    };

    expect(v19.onboardingData.industry).toEqual("restaurant");

    const v20 = migrate_v19_to_v20(v19);

    expect(v20.onboardingData.industryId).toEqual("restaurant");
    expect(v20.onboardingData).not.toContain("industry");
  });
});

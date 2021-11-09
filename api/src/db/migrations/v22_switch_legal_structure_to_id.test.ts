import { generatev21OnboardingData, generatev21User, v21UserData } from "./v21_add_tax_fields";
import { migrate_v21_to_v22 } from "./v22_switch_legal_structure_to_id";

describe("migrate_v21_to_v22", () => {
  const user = generatev21User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("turns legalStructure into legalStructureId", () => {
    const onboardingData = generatev21OnboardingData({ legalStructure: "limited-liability-company" });
    const v21: v21UserData = {
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

    expect(v21.onboardingData.legalStructure).toEqual("limited-liability-company");

    const v22 = migrate_v21_to_v22(v21);

    expect(v22.onboardingData.legalStructureId).toEqual("limited-liability-company");
    expect(v22.onboardingData).not.toContain("legalStructure");
  });
});

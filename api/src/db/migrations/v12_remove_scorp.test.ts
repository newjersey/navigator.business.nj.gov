import { generatev11OnboardingData, generatev11User, v11UserData } from "./v11_change_license_statuses";
import { migrate_v11_to_v12 } from "./v12_remove_scorp";

describe("migrate_v11_to_v12", () => {
  const user = generatev11User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("turns scorp legal structure to undefined", () => {
    const onboardingData = generatev11OnboardingData({ legalStructure: "s-corporation" });
    const v11: v11UserData = {
      user,
      onboardingData,
      formProgress,
      taskProgress,
      licenseData: undefined,
      version: 11,
    };

    const v12 = migrate_v11_to_v12(v11);

    expect(v12.onboardingData.legalStructure).toBeUndefined();
  });

  it("keeps legal structure as is when not scorp", () => {
    const onboardingData = generatev11OnboardingData({ legalStructure: "c-corporation" });
    const v11: v11UserData = {
      user,
      onboardingData,
      formProgress,
      taskProgress,
      licenseData: undefined,
      version: 11,
    };

    const v12 = migrate_v11_to_v12(v11);

    expect(v12.onboardingData.legalStructure).toEqual("c-corporation");
  });
});

import { generateV7OnboardingData, generateV7User, v7UserData } from "./v7_add_license_data";
import { migrate_v7_to_v8 } from "./v8_remove_bcorp";

describe("migrate_v7_to_v8", () => {
  const user = generateV7User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("turns bcorp legal structure to undefined", () => {
    const onboardingData = generateV7OnboardingData({ legalStructure: "b-corporation" });
    const v7: v7UserData = {
      user,
      onboardingData,
      formProgress,
      taskProgress,
      licenseSearchData: undefined,
      version: 7,
    };

    const v8 = migrate_v7_to_v8(v7);

    expect(v8.onboardingData.legalStructure).toBeUndefined();
  });

  it("keeps legal structure as is when not bcorp", () => {
    const onboardingData = generateV7OnboardingData({ legalStructure: "c-corporation" });
    const v7: v7UserData = {
      user,
      onboardingData,
      formProgress,
      taskProgress,
      licenseSearchData: undefined,
      version: 7,
    };

    const v8 = migrate_v7_to_v8(v7);

    expect(v8.onboardingData.legalStructure).toEqual("c-corporation");
  });
});

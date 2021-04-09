/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { generateV2OnboardingData, generateV2User, v2UserData } from "./v2_formData_to_onboardingData";
import { migrate_v2_to_v3 } from "./v3_change_LegalStructure";

describe("migrate_v2_to_v3", () => {
  const user = generateV2User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("translates legal structure to new value", () => {
    const onboardingData = generateV2OnboardingData({
      legalStructure: "Sole Proprietorship",
    });

    const v2: v2UserData = { user, onboardingData, formProgress, taskProgress, version: 2 };

    expect(migrate_v2_to_v3(v2)).toEqual({
      user,
      formProgress,
      taskProgress: {},
      onboardingData: {
        ...onboardingData,
        legalStructure: "sole-proprietorship",
      },
      version: 3,
    });
  });

  it("translates another legal structure to new value", () => {
    const onboardingData = generateV2OnboardingData({
      legalStructure: "Limited Liability Company (LLC)",
    });

    const v2: v2UserData = { user, onboardingData, formProgress, taskProgress, version: 2 };

    expect(migrate_v2_to_v3(v2)).toEqual({
      user,
      formProgress,
      taskProgress: {},
      onboardingData: {
        ...onboardingData,
        legalStructure: "limited-liability-company",
      },
      version: 3,
    });
  });

  it("translates undefined legal structure to undefined", () => {
    const onboardingData = generateV2OnboardingData({
      legalStructure: undefined,
    });

    const v2: v2UserData = { user, onboardingData, formProgress, taskProgress, version: 2 };

    expect(migrate_v2_to_v3(v2)).toEqual({
      user,
      formProgress,
      taskProgress: {},
      onboardingData: {
        ...onboardingData,
        legalStructure: undefined,
      },
      version: 3,
    });
  });
});

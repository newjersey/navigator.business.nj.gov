/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { generateV4OnboardingData, generateV4User, v4UserData } from "./v4_add_municipality";
import { migrate_v4_to_v5 } from "./v5_add_liquor_license";

describe("migrate_v4_to_v5", () => {
  const user = generateV4User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("adds false liquor license", () => {
    const onboardingData = generateV4OnboardingData({});

    const v4: v4UserData = { user, onboardingData, formProgress, taskProgress, version: 4 };

    expect(migrate_v4_to_v5(v4)).toEqual({
      user,
      formProgress,
      taskProgress: {},
      onboardingData: {
        ...onboardingData,
        liquorLicense: false,
      },
      version: 5,
    });
  });
});

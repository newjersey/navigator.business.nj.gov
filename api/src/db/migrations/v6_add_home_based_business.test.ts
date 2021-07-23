/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { generateV5OnboardingData, generateV5User, v5UserData } from "./v5_add_liquor_license";
import { migrate_v5_to_v6 } from "./v6_add_home_based_business";

describe("migrate_v5_to_v6", () => {
  const user = generateV5User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("adds false for home-based business", () => {
    const onboardingData = generateV5OnboardingData({});

    const v5: v5UserData = { user, onboardingData, formProgress, taskProgress, version: 5 };

    expect(migrate_v5_to_v6(v5)).toEqual({
      user,
      formProgress,
      taskProgress: {},
      onboardingData: {
        ...onboardingData,
        homeBasedBusiness: false,
      },
      version: 6,
    });
  });
});

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { generateV3OnboardingData, generateV3User, v3UserData } from "./v3_change_LegalStructure";
import { migrate_v3_to_v4 } from "./v4_add_municipality";

describe("migrate_v3_to_v4", () => {
  const user = generateV3User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("adds undefined municipality", () => {
    const onboardingData = generateV3OnboardingData({});

    const v3: v3UserData = { user, onboardingData, formProgress, taskProgress, version: 3 };

    expect(migrate_v3_to_v4(v3)).toEqual({
      user,
      formProgress,
      taskProgress: {},
      onboardingData: {
        ...onboardingData,
        municipality: undefined,
      },
      version: 4,
    });
  });
});

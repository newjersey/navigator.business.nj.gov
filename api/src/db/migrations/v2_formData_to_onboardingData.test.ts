/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { generateUser } from "../../domain/factories";
import { v1UserData } from "./v1_addTaskProgress";
import { generateFormData } from "./migrated-types";
import { migrate_v1_to_v2 } from "./v2_formData_to_onboardingData";

describe("migrate_v1_to_v2", () => {
  const user = generateUser({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};

  it("adds moves business name, industry, and legal structure to onboarding data", () => {
    const formData = generateFormData({
      businessName: { businessName: "Applebees" },
      businessStructure: { businessStructure: "Sole Proprietorship" },
      businessType: { businessType: "cosmetology" },
    });

    const v1: v1UserData = { user, formData, formProgress, taskProgress, version: 1 };

    expect(migrate_v1_to_v2(v1)).toEqual({
      user,
      formProgress,
      taskProgress: {},
      version: 2,
      onboardingData: {
        businessName: "Applebees",
        industry: "cosmetology",
        legalStructure: "Sole Proprietorship",
      },
    });
  });

  it("replaces undefined businessName with empty string", () => {
    const formData = generateFormData({});
    formData.businessName!.businessName = undefined;
    let v1: v1UserData = { user, formData, formProgress, taskProgress, version: 1 };
    expect(migrate_v1_to_v2(v1).onboardingData.businessName).toEqual("");

    formData.businessName = undefined;
    v1 = { user, formData, formProgress, taskProgress, version: 1 };
    expect(migrate_v1_to_v2(v1).onboardingData.businessName).toEqual("");
  });

  it("replaces undefined industry with generic", () => {
    const formData = generateFormData({});
    formData.businessType!.businessType = undefined;
    let v1: v1UserData = { user, formData, formProgress, taskProgress, version: 1 };
    expect(migrate_v1_to_v2(v1).onboardingData.industry).toEqual("generic");

    formData.businessType = undefined;
    v1 = { user, formData, formProgress, taskProgress, version: 1 };
    expect(migrate_v1_to_v2(v1).onboardingData.industry).toEqual("generic");
  });
});

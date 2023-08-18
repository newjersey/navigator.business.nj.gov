import { generateV117ProfileData, generateV117UserData } from "./v117_add_onboarding_nonprofit";
import { migrate_v117_to_v118 } from "./v118_set_operating_phase_remote_seller_worker";

describe("migrate_v117_to_v118", () => {
  it("sets operating phase to NEEDS_TO_FORM for Remote Seller if it is NEEDS_BUSINESS_STRUCTURE", () => {
    const v117UserData = generateV117UserData({
      profileData: generateV117ProfileData({
        businessPersona: "FOREIGN",
        foreignBusinessType: "REMOTE_SELLER",
        operatingPhase: "NEEDS_BUSINESS_STRUCTURE"
      })
    });

    expect(migrate_v117_to_v118(v117UserData).profileData.operatingPhase).toEqual("NEEDS_TO_FORM");
  });

  it("sets operating phase to NEEDS_TO_FORM for Remote Worker if it is NEEDS_BUSINESS_STRUCTURE", () => {
    const v117UserData = generateV117UserData({
      profileData: generateV117ProfileData({
        businessPersona: "FOREIGN",
        foreignBusinessType: "REMOTE_WORKER",
        operatingPhase: "NEEDS_BUSINESS_STRUCTURE"
      })
    });

    expect(migrate_v117_to_v118(v117UserData).profileData.operatingPhase).toEqual("NEEDS_TO_FORM");
  });

  it("keeps operating phase for non remote seller / remote worker", () => {
    const v117UserData = generateV117UserData({
      profileData: generateV117ProfileData({
        businessPersona: "FOREIGN",
        foreignBusinessType: "NEXUS",
        operatingPhase: "NEEDS_BUSINESS_STRUCTURE"
      })
    });

    expect(migrate_v117_to_v118(v117UserData).profileData.operatingPhase).toEqual("NEEDS_BUSINESS_STRUCTURE");
  });
});

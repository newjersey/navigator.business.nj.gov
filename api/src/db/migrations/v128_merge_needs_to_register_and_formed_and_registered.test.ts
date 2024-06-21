import {
  generateV127Business,
  generateV127Preferences,
  generateV127ProfileData,
  generateV127UserData,
  v127OperatingPhase,
} from "@db/migrations/v127_create_remote_worker_seller_phase";
import { migrate_v127_to_v128 } from "@db/migrations/v128_merge_needs_to_register_and_formed_and_registered";

describe("migrate_v127_to_v128", () => {
  it("updates operatingPhase from NEEDS_TO_REGISTER_FOR_TAXES to FORMED and removes tax registration nudge", () => {
    const id = "biz-1";
    const v127ProfileData = generateV127ProfileData({});
    const v127Business = generateV127Business({
      id,
      profileData: {
        ...v127ProfileData,
        operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
      },
      preferences: generateV127Preferences({
        visibleSidebarCards: ["registered-for-taxes-nudge"],
      }),
    });
    const v127UserData = generateV127UserData({ businesses: { "biz-1": v127Business } });

    const v128 = migrate_v127_to_v128(v127UserData);
    expect(v128.businesses[id].profileData.operatingPhase).toEqual("FORMED");
    expect(
      v128.businesses[id].preferences.visibleSidebarCards.includes("registered-for-taxes-nudge")
    ).toEqual(false);
  });

  it("changes operatingPhase from FORMED_AND_REGISTERED to FORMED", () => {
    const id = "biz-1";
    const v127ProfileData = generateV127ProfileData({});
    const v127Business = generateV127Business({
      id,
      profileData: {
        ...v127ProfileData,
        operatingPhase: "FORMED_AND_REGISTERED",
      },
    });
    const v127UserData = generateV127UserData({ businesses: { "biz-1": v127Business } });

    const v128 = migrate_v127_to_v128(v127UserData);
    expect(v128.businesses[id].profileData.operatingPhase).toEqual("FORMED");
  });

  it.each([
    "GUEST_MODE",
    "NEEDS_TO_FORM",
    "NEEDS_BUSINESS_STRUCTURE",
    "FORMED",
    "UP_AND_RUNNING",
    "UP_AND_RUNNING_OWNING",
    "REMOTE_SELLER_WORKER",
  ])("doesn't update operatingPhase if %s", (operatingPhase) => {
    const id = "biz-1";
    const v127ProfileData = generateV127ProfileData({});
    const v127Business = generateV127Business({
      id,
      profileData: {
        ...v127ProfileData,
        operatingPhase: operatingPhase as v127OperatingPhase,
      },
    });
    const v127UserData = generateV127UserData({ businesses: { "biz-1": v127Business } });

    const v128 = migrate_v127_to_v128(v127UserData);
    expect(v128.businesses[id].profileData.operatingPhase).toEqual(operatingPhase);
  });
});

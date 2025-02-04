import {
  generatev154Business,
  generatev154UserData,
} from "@db/migrations/v154_add_business_operating_length_and_nonprofit_status";
import { migrate_v154_to_v155 } from "@db/migrations/v155_add_user_id_and_version_to_business";

describe("v155 migration adds version, versionWhenCreated and userId fields to the businesses object", () => {
  it("should upgrade v155 user by adding version, versionWhenCreated and userId fields to the businesses object", () => {
    const v154UserData = generatev154UserData({
      businesses: {
        "biz-1": generatev154Business({ id: "biz-1" }),
        "biz-2": generatev154Business({ id: "biz-2" }),
        "biz-3": generatev154Business({ id: "biz-3" }),
      },
      version: 154,
      versionWhenCreated: 151,
    });

    const migratedUserData = migrate_v154_to_v155(v154UserData);
    expect(migratedUserData.version).toBe(155);

    for (const business of Object.values(migratedUserData.businesses)) {
      expect(business.version).toBeDefined();
      expect(typeof business.version).toBe("number");
      expect(business.version).toBe(155);

      expect(business.versionWhenCreated).toBeDefined();
      expect(typeof business.versionWhenCreated).toBe("number");
      expect(business.versionWhenCreated).toBe(155);

      expect(business.userId).toBeDefined();
      expect(typeof business.userId).toBe("string");
      expect(business.userId).toEqual(migratedUserData.user.id);
    }
  });
});

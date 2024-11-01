import { generatev150UserData } from "@db/migrations/v150_remove_needs_nexus_dba_name";
import { migrate_v150_to_v151 } from "@db/migrations/v151_extract_business_data";

describe("v151 migration adds version field to businesses object", () => {
  it("should upgrade v150 user by adding version field to businesses object", () => {
    const v150UserData = generatev150UserData({});

    const migratedUserData = migrate_v150_to_v151(v150UserData);
    expect(migratedUserData.version).toBe(151);
    for (const business of Object.values(migratedUserData.businesses)) {
      expect(business.version).toBe(151);
    }
  });
});

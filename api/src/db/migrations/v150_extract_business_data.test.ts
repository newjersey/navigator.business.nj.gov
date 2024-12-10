import {
  generatev149Business,
  generatev149LicenseDetails,
  generatev149ProfileData,
  generatev149UserData,
  getRandomv149LicenseStatus,
} from "@db/migrations/v149_add_environment_data";
import { migrate_v149_to_v150 } from "@db/migrations/v150_extract_business_data";

describe("v150 migration adds version field to businesses object", () => {
  it("should upgrade v149 user by adding version field to businesses object", () => {
    const id = "business-1";
    const v149ProfileData = generatev149ProfileData({ industryId: "employment-agency" });
    const v149Business = generatev149Business({
      profileData: v149ProfileData,
      licenseData: {
        lastUpdatedISO: "some last iso",
        licenses: {
          ["Pharmacy-Pharmacy"]: generatev149LicenseDetails({
            licenseStatus: getRandomv149LicenseStatus(),
          }),
        },
      },
      id,
    });

    const v149UserData = generatev149UserData({
      businesses: { id: v149Business },
    });

    const migratedUserData = migrate_v149_to_v150(v149UserData);
    expect(migratedUserData.version).toBe(150);
    for (const business of Object.values(migratedUserData.businesses)) {
      expect(business.version).toBe(150);
    }
  });
});

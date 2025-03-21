import {
  generatev145Business,
  generatev145LicenseDetails,
  generatev145ProfileData,
  generatev145UserData,
} from "@db/migrations/v145_add_traveling_circus_or_carnival";
import { migrate_v145_to_v146 } from "@db/migrations/v146_remove_haserror_field_from_licensedetails";

describe("v146_remove_haserror_field", () => {
  it("correctly upgrades a v145 user by removing hasError field from license details", () => {
    const id = "biz-1";
    const v145ProfileData = generatev145ProfileData({ industryId: "employment-agency" });
    const v145Business = generatev145Business({
      profileData: v145ProfileData,
      licenseData: {
        lastUpdatedISO: "some last iso",
        licenses: {
          ["Pharmacy-Pharmacy"]: generatev145LicenseDetails({
            hasError: true,
          }),
          ["Accountancy-Firm Registration"]: generatev145LicenseDetails({
            hasError: false,
          }),
        },
      },
      id,
    });
    const v145User = generatev145UserData({
      businesses: { "biz-1": v145Business },
    });

    const fieldToDelete = "hasError";

    const v145Licenses = v145User.businesses[id].licenseData?.licenses;
    expect(v145Licenses?.["Pharmacy-Pharmacy"]).toHaveProperty(fieldToDelete);
    expect(v145Licenses?.["Accountancy-Firm Registration"]).toHaveProperty(fieldToDelete);

    const v146User = migrate_v145_to_v146(v145User);

    const v146Licenses = v146User.businesses[id].licenseData?.licenses;
    expect(v146Licenses?.["Pharmacy-Pharmacy"]).not.toHaveProperty(fieldToDelete);
    expect(v146Licenses?.["Accountancy-Firm Registration"]).not.toHaveProperty(fieldToDelete);
  });
});

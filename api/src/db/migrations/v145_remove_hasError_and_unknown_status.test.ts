import {
  generatev144Business,
  generatev144LicenseData, generatev144LicenseDetails,
  generatev144ProfileData, v144LicenseDetails, v144LicenseName,
  v144TaskProgress
} from "@db/migrations/v144_add_raffle_bingo_games";
import {migrate_v137Business_to_v138Business} from "@db/migrations/v138_multi_license_support";

describe("v145", () => {
  const initialTaskProgress: Record<string, v144TaskProgress> = {
    "telemarketing-license": "COMPLETED",
  };

  const licenseDetails: Record<v144LicenseName, v144LicenseDetails> = "hvac-license": generatev144LicenseDetails({});
  const initialLicenseData = generatev144LicenseData({licenses: licenseDetails});

  it("returns business when there is no license data", () => {
    const initialBusiness = generatev144Business({
      taskProgress: initialTaskProgress,
      licenseData: initialLicenseData,
      profileData: generatev144ProfileData({industryId: "health-care-services-firm-renewal"}),
    });

    const updatedBusiness = migrate_v137Business_to_v138Business(initialBusiness);

    expect(updatedBusiness).toEqual(initialBusiness);
  });
});

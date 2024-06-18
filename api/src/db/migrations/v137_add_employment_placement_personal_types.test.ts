import {
  generatev136Business,
  generatev136ProfileData,
  generatev136UserData,
} from "@db/migrations/v136_add_user_account_creation_source";
import { migrate_v136_to_v137 } from "@db/migrations/v137_add_employment_placement_personal_types";

describe("v137_add_employment_placement_personal_types", () => {
  it("correctly upgrades a v136 user by adding employmentPersonnelServiceType and employmentPlacementType", () => {
    const id = "biz-1";
    const v136ProfileData = generatev136ProfileData({ industryId: "employment-agency" });
    const v136Business = generatev136Business({
      profileData: v136ProfileData,
      id,
    });
    const v136User = generatev136UserData({
      businesses: { "biz-1": v136Business },
    });

    expect(v136User.businesses[id].profileData).not.toHaveProperty("employmentPersonnelServiceType");
    expect(v136User.businesses[id].profileData).not.toHaveProperty("employmentPlacementType");

    const v137User = migrate_v136_to_v137(v136User);

    expect(v137User.businesses[id].profileData).toHaveProperty("employmentPersonnelServiceType");
    expect(v137User.businesses[id].profileData).toHaveProperty("employmentPlacementType");
    expect(v137User.businesses[id].profileData.employmentPersonnelServiceType).toEqual(undefined);
    expect(v137User.businesses[id].profileData.employmentPlacementType).toEqual(undefined);
  });
});

import {
  generatev135Business,
  generatev135ProfileData,
  generatev135UserData,
} from "@db/migrations/v135_use_interstate_logistics_and_transport_fields";
import { migrate_v135_to_v136 } from "@db/migrations/v136_add_employment_placement_personal_types";

describe("v136_add_employment_placement_personal_types", () => {
  it("correctly upgrades a v135 user by adding employmentPersonnelServiceType and employmentPlacementType", () => {
    const id = "biz-1";
    const v135ProfileData = generatev135ProfileData({ industryId: "employment-agency" });
    const v135Business = generatev135Business({
      profileData: v135ProfileData,
      id,
    });
    const v135User = generatev135UserData({
      businesses: { "biz-1": v135Business },
    });

    expect(v135User.businesses[id].profileData).not.toHaveProperty("employmentPersonnelServiceType");
    expect(v135User.businesses[id].profileData).not.toHaveProperty("employmentPlacementType");

    const v136User = migrate_v135_to_v136(v135User);

    expect(v136User.businesses[id].profileData).toHaveProperty("employmentPersonnelServiceType");
    expect(v136User.businesses[id].profileData).toHaveProperty("employmentPlacementType");
    expect(v136User.businesses[id].profileData.employmentPersonnelServiceType).toEqual(undefined);
    expect(v136User.businesses[id].profileData.employmentPlacementType).toEqual(undefined);
  });
});

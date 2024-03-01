import {
  generateV129Business,
  generateV129ProfileData,
  generateV129UserData,
} from "@db/migrations/v129_add_elevator_owning_business_to_profile";
import { migrate_v129_to_v130 } from "@db/migrations/v130_remove_nexus_location_in_new_jersey";

describe("v130_remove_nexus_location_in_new_jersey", () => {
  it("adds officeInNJ to foreignBusinessIds if nexusLocationInNewJersey is true", () => {
    const id = "biz-1";
    const v129ProfileData = generateV129ProfileData({});
    const v129Business = generateV129Business({
      id,
      profileData: {
        ...v129ProfileData,
        foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
        nexusLocationInNewJersey: true,
      },
    });
    const v129UserData = generateV129UserData({ businesses: { "biz-1": v129Business } });

    const v130 = migrate_v129_to_v130(v129UserData);
    expect(v130.businesses[id].profileData.foreignBusinessTypeIds.includes("officeInNJ")).toBe(true);
  });

  it("removes officeInNJ from foreignBusinessIds if nexusLocationInNewJersey is false", () => {
    const id = "biz-1";
    const v129ProfileData = generateV129ProfileData({});
    const v129Business = generateV129Business({
      id,
      profileData: {
        ...v129ProfileData,
        foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
        nexusLocationInNewJersey: false,
      },
    });
    const v129UserData = generateV129UserData({ businesses: { "biz-1": v129Business } });

    const v130 = migrate_v129_to_v130(v129UserData);
    expect(v130.businesses[id].profileData.foreignBusinessTypeIds.includes("officeInNJ")).toBe(false);
  });

  it("doesn't add officeInNJ to foreignBusinessIds if it's already present", () => {
    const id = "biz-1";
    const v129ProfileData = generateV129ProfileData({});
    const v129Business = generateV129Business({
      id,
      profileData: {
        ...v129ProfileData,
        foreignBusinessTypeIds: ["employeeOrContractorInNJ", "officeInNJ"],
        nexusLocationInNewJersey: true,
      },
    });
    const v129UserData = generateV129UserData({ businesses: { "biz-1": v129Business } });

    const v130 = migrate_v129_to_v130(v129UserData);
    expect(v130.businesses[id].profileData.foreignBusinessTypeIds).toStrictEqual([
      "employeeOrContractorInNJ",
      "officeInNJ",
    ]);
  });

  it("removes nexusLocationInNewJersey from profileData", () => {
    const id = "biz-1";
    const v129ProfileData = generateV129ProfileData({});
    const v129Business = generateV129Business({
      id,
      profileData: {
        ...v129ProfileData,
        nexusLocationInNewJersey: true,
      },
    });
    const v129UserData = generateV129UserData({ businesses: { "biz-1": v129Business } });

    const v130 = migrate_v129_to_v130(v129UserData);
    expect(v130.businesses[id].profileData.nexusLocationInNewJersey).toBeUndefined();
  });
});

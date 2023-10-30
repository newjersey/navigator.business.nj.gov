import {
  generateV104ProfileData,
  generateV104UserData,
} from "@db/migrations/v104_add_needs_nexus_dba_name_field";
import { migrate_v104_to_v105 } from "@db/migrations/v105_add_pet_care_essential_question";

describe("migrate_v104_to_v105", () => {
  it("sets the pet care essential question to true for any existing user", () => {
    const v104 = generateV104UserData({
      profileData: generateV104ProfileData({ industryId: "petcare" }),
    });
    const v105 = migrate_v104_to_v105(v104);
    expect(v105).toEqual({
      ...v104,
      profileData: {
        ...v104.profileData,
        willSellPetCareItems: true,
      },
      version: 105,
    });
  });

  it("sets the pet care essential question to undefined for any new user", () => {
    const v104 = generateV104UserData({
      profileData: generateV104ProfileData({}),
    });
    const v105 = migrate_v104_to_v105(v104);
    expect(v105).toEqual({
      ...v104,
      profileData: {
        ...v104.profileData,
        willSellPetCareItems: undefined,
      },
      version: 105,
    });
  });
});

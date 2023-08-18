import { generateV105ProfileData, generateV105UserData } from "./v105_add_pet_care_essential_question";
import { migrate_v105_to_v106 } from "./v106_add_pet_care_housing_essential_question";

describe("migrate_v105_to_v106", () => {
  it("sets the pet care essential question to true for any existing user", () => {
    const v105 = generateV105UserData({
      profileData: generateV105ProfileData({ industryId: "petcare" })
    });
    const v106 = migrate_v105_to_v106(v105);
    expect(v106).toEqual({
      ...v105,
      profileData: {
        ...v105.profileData,
        petCareHousing: true
      },
      version: 106
    });
  });
});

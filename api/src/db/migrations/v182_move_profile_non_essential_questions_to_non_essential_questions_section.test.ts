import {
  generatev181Business,
  generatev181ProfileData,
  generatev181UserData,
} from "@db/migrations/v181_add_updates_reminders_and_phone_number";
import { migrate_v181_to_v182 } from "@db/migrations/v182_move_profile_non_essential_questions_to_non_essential_questions_section";

describe("migrate_v181_to_v182", () => {
  it("move vacantPropertyOwner, CarnivalOwning and CarnivalFire to nonEssentialQuestion section", async () => {
    const v181UserData = generatev181UserData({
      businesses: {
        "123": generatev181Business({
          id: "123",
          profileData: generatev181ProfileData({
            vacantPropertyOwner: true,
            carnivalRideOwningBusiness: false,
            travelingCircusOrCarnivalOwningBusiness: undefined,
          }),
        }),
      },
    });

    const v182UserData = migrate_v181_to_v182(v181UserData);
    expect(v182UserData.version).toBe(182);
    expect(
      v182UserData.businesses["123"].profileData.nonEssentialRadioAnswers["vacantPropertyOwner"],
    ).toBe(true);
    expect(
      v182UserData.businesses["123"].profileData.nonEssentialRadioAnswers[
        "carnivalRideOwningBusiness"
      ],
    ).toBe(false);
    expect(
      v182UserData.businesses["123"].profileData.nonEssentialRadioAnswers[
        "travelingCircusOrCarnivalOwningBusiness"
      ],
    ).toBe(undefined);
  });
});

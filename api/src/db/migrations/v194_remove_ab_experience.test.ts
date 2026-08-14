import {
  generatev193Business,
  generatev193BusinessUser,
  generatev193UserData,
} from "@db/migrations/v193_rotate_stranded_legacy_kms_fields";
import { migrate_v193_to_v194 } from "@db/migrations/v194_remove_ab_experience";

describe("migrate_v193_to_v194", () => {
  it("removes abExperience from the user", () => {
    const v193UserData = generatev193UserData({
      user: generatev193BusinessUser({ abExperience: "ExperienceB" }),
    });

    const v194UserData = migrate_v193_to_v194(v193UserData);
    expect(v194UserData.user).not.toHaveProperty("abExperience");
  });

  it("removes select-industry from taskProgress", () => {
    const v193UserData = generatev193UserData({
      businesses: {
        "123": generatev193Business({
          id: "123",
          taskProgress: {
            "select-industry": "COMPLETED",
            "some-other-task": "TO_DO",
          },
        }),
      },
    });

    const v194UserData = migrate_v193_to_v194(v193UserData);
    expect(v194UserData.businesses["123"].taskProgress).toEqual({
      "some-other-task": "TO_DO",
    });
  });

  it("leaves taskProgress alone when select-industry is not present", () => {
    const v193UserData = generatev193UserData({
      businesses: {
        "123": generatev193Business({
          id: "123",
          taskProgress: {
            "some-other-task": "COMPLETED",
          },
        }),
      },
    });

    const v194UserData = migrate_v193_to_v194(v193UserData);
    expect(v194UserData.businesses["123"].taskProgress).toEqual({
      "some-other-task": "COMPLETED",
    });
  });
});

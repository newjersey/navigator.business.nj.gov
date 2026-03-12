import { generatev190UserData } from "@db/migrations/v190_remove_hidden_fundings_and_certifications";
import { migrate_v190_to_v191 } from "@db/migrations/v191_set_default_experience";

describe("migrate_v190_to_v191", () => {
  it("preserves existing abExperience value when set", () => {
    const v190UserData = generatev190UserData({});
    v190UserData.user.abExperience = "ExperienceB";

    const v191UserData = migrate_v190_to_v191(v190UserData);
    expect(v191UserData.user.abExperience).toEqual("ExperienceB");
  });

  it("sets abExperience to ExperienceA when undefined", () => {
    const v190UserData = generatev190UserData({});
    v190UserData.user = {
      ...v190UserData.user,
      abExperience: undefined as unknown as "ExperienceA",
    };

    const v191UserData = migrate_v190_to_v191(v190UserData);
    expect(v191UserData.user.abExperience).toEqual("ExperienceA");
  });
});

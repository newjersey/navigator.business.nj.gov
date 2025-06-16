import {
  generatev165Business,
  generatev165ProfileData,
  generatev165UserData,
} from "@db/migrations/v165_add_last_updated_iso_to_xray_registration_data";
import { migrate_v165_to_v166 } from "@db/migrations/v166_add_roadmap_task_data";

describe("migrate_v165Business_to_v166Business", () => {
  it("deletes business-vehicle-title-reg from nonEssentialRadioAnswers object", async () => {
    const id = "biz-1";
    const v165userData = generatev165UserData({
      businesses: {
        id: generatev165Business({
          id,
          profileData: generatev165ProfileData({
            nonEssentialRadioAnswers: {
              "business-vehicle-title-reg": true,
            },
          }),
        }),
      },
    });

    const result = await migrate_v165_to_v166(v165userData);
    expect(result.businesses[id].profileData.nonEssentialRadioAnswers).toEqual({});
  });

  it("set manageBusinessVehicles to True when nonEssentialRadioAnswers is True", async () => {
    const id = "biz-1";
    const v165userData = generatev165UserData({
      businesses: {
        id: generatev165Business({
          id,
          profileData: generatev165ProfileData({
            nonEssentialRadioAnswers: {
              "business-vehicle-title-reg": true,
            },
          }),
        }),
      },
    });

    const result = await migrate_v165_to_v166(v165userData);
    expect(result.businesses[id].roadmapTaskData.manageBusinessVehicles).toEqual(true);
  });

  it("set manage-business-vehicles taskProgress to COMPLETED when nonEssentialRadioAnswers is True", async () => {
    const id = "biz-1";
    const v165userData = generatev165UserData({
      businesses: {
        id: generatev165Business({
          id,
          profileData: generatev165ProfileData({
            nonEssentialRadioAnswers: {
              "business-vehicle-title-reg": true,
            },
          }),
        }),
      },
    });

    const result = await migrate_v165_to_v166(v165userData);
    expect(result.businesses[id].taskProgress["manage-business-vehicles"]).toEqual("COMPLETED");
  });

  it("set manageBusinessVehicles to False when nonEssentialRadioAnswers is False", async () => {
    const id = "biz-1";
    const v165userData = generatev165UserData({
      businesses: {
        id: generatev165Business({
          id,
          profileData: generatev165ProfileData({
            nonEssentialRadioAnswers: {
              "business-vehicle-title-reg": false,
            },
          }),
        }),
      },
    });

    const result = await migrate_v165_to_v166(v165userData);
    expect(result.businesses[id].roadmapTaskData.manageBusinessVehicles).toEqual(false);
  });

  it("set manage-business-vehicles taskProgress to TO_DO when nonEssentialRadioAnswers is False", async () => {
    const id = "biz-1";
    const v165userData = generatev165UserData({
      businesses: {
        id: generatev165Business({
          id,
          profileData: generatev165ProfileData({
            nonEssentialRadioAnswers: {
              "business-vehicle-title-reg": false,
            },
          }),
        }),
      },
    });

    const result = await migrate_v165_to_v166(v165userData);
    expect(result.businesses[id].taskProgress["manage-business-vehicles"]).toEqual("TO_DO");
  });

  it("set manageBusinessVehicles to undefined when nonEssentialRadioAnswers is undefined", async () => {
    const id = "biz-1";
    const v165userData = generatev165UserData({
      businesses: {
        id: generatev165Business({
          id,
          profileData: generatev165ProfileData({
            nonEssentialRadioAnswers: {},
          }),
        }),
      },
    });

    const result = await migrate_v165_to_v166(v165userData);
    expect(result.businesses[id].roadmapTaskData.manageBusinessVehicles).toEqual(undefined);
  });
});

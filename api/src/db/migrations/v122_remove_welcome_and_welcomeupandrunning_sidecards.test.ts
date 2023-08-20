import {
  generateV121Business,
  generateV121Preferences,
  generateV121UserData,
} from "./v121_add_nonprofit_formation_fields";
import { migrate_v121_to_v122 } from "./v122_remove_welcome_and_welcomeupandrunning_sidecards";

describe("migrate_v121_to_v122", () => {
  it("removes the welcome and welcome-up-and-running from sidebarCards", () => {
    const id = "biz-1";
    const v121Preferences = generateV121Preferences({
      visibleSidebarCards: ["welcome", "welcome-up-and-running", "other-card"],
    });
    const v121Business = generateV121Business({ id: id, preferences: v121Preferences });
    const v121UserData = generateV121UserData({ businesses: { "biz-1": v121Business } });

    const v122 = migrate_v121_to_v122(v121UserData);
    expect(v122.businesses[id].preferences.visibleSidebarCards).toEqual(["other-card"]);
  });
});

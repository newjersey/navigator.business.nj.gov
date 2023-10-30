import {
  generateV122Business,
  generateV122Preferences,
  generateV122UserData,
} from "@db/migrations/v122_remove_welcome_and_welcomeupandrunning_sidecards";
import { migrate_v122_to_v123 } from "@db/migrations/v123_remove_account_creation_sidecards";

describe("migrate_v122_to_v123", () => {
  it("removes the successful-registration card from sidebarCards", () => {
    const id = "biz-1";
    const v122Preferences = generateV122Preferences({
      visibleSidebarCards: ["other-card", "successful-registration"],
    });
    const v122Business = generateV122Business({ id: id, preferences: v122Preferences });
    const v122UserData = generateV122UserData({ businesses: { "biz-1": v122Business } });

    const v123 = migrate_v122_to_v123(v122UserData);
    expect(v123.businesses[id].preferences.visibleSidebarCards).toEqual(["other-card"]);
  });
});

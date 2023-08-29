import {
  generateV123Business,
  generateV123Preferences,
  generateV123UserData,
} from "./v123_remove_account_creation_sidecards";
import { migrate_v123_to_v124 } from "./v124_remove_task_progress_sidebar_card";

describe("migrate_v123_to_v124", () => {
  it("removes the task-progress card from sidebarCards", () => {
    const id = "biz-1";
    const v123Preferences = generateV123Preferences({
      visibleSidebarCards: ["other-card", "task-progress"],
    });
    const v123Business = generateV123Business({ id: id, preferences: v123Preferences });
    const v123UserData = generateV123UserData({ businesses: { "biz-1": v123Business } });

    const v123 = migrate_v123_to_v124(v123UserData);
    expect(v123.businesses[id].preferences.visibleSidebarCards).toEqual(["other-card"]);
  });
});

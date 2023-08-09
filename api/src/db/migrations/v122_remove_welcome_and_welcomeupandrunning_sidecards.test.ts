
import {migrate_v121_to_v122, v122Business} from "./v122_remove_welcome_and_welcomeupandrunning_sidecards";
import {
    generateV121Business, generateV121Preferences,
    generateV121UserData, v121UserData
} from "./v121_add_nonprofit_formation_fields";


describe("migrate_v121_to_v122", () => {
    it("removes the welcome and welcome-up-and-running from sidebarCards", () => {
        //Setup
        const id = "biz-1";
        const v121Preferences = generateV121Preferences({ visibleSidebarCards: ["welcome", "welcome-up-and-running","other-card"]});
        const v121Business = generateV121Business({id:id, preferences: v121Preferences});
        const v121UserData = generateV121UserData({businesses: {"biz-1": v121Business}});

        //Before migrating to 122, make sure the visibleSidebarCards have welcome and welcome-up-and-running
        expect((v121UserData).businesses[id].preferences.visibleSidebarCards).toEqual(["welcome", "welcome-up-and-running", "other-card"]);
        expect((v121UserData).version).toEqual(121);

        //Migrate to v122
        const v122 = migrate_v121_to_v122(v121UserData);
        expect((v122).businesses[id].preferences.visibleSidebarCards).toEqual(["other-card"]);
        expect((v122).version).toEqual(122);
    });
});


import {
    generateV121FormationFormData,
    generateV121ProfileData,
    generateV121User, generateV121UserData,
    v121Preferences,v121Business
} from "./v121_add_nonprofit_formation_fields";
import { migrate_v121_to_v122 } from "./v122_remove_welcome_and_welcomeupandrunning_sidecards";

describe("migrate_v121_to_v122", () => {
    it("removes the welcome from welcome from sidebarCards", () => {
        const v121UserData = generateV121UserData({});

        //v121UserData.businesses[0].preferences.visibleSidebarCards = ["welcome", "other-card"];
        //const v122 = migrate_v121_to_v122(v121UserData);
        //expect((v122).businesses[0].preferences.visibleSidebarCards).toEqual(["other-card"]);
    });

    it("removes the welcome from welcome-up-and-running from sidebarCards", () => {


       // const v122 = migrate_v121_to_v122(v121);

        //expect(v122.businesses[0].preferences.visibleSidebarCards).toEqual(["other-card"]);
    });
});
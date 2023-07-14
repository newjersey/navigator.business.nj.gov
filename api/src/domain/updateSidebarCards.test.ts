import { formationTaskId } from "@shared/domain-logic/taskIds";
import { OperatingPhaseId } from "@shared/operatingPhase";
import {
  generateMunicipality,
  generatePreferences,
  generateProfileData,
  generateUserData,
} from "@shared/test";
import { updateSidebarCards } from "./updateSidebarCards";

import { getCurrentBusiness } from "@shared/businessHelpers";

describe("updateRoadmapSidebarCards", () => {
  describe("successful registration", () => {
    it("does not add successful-registration card if not-registered card does not exist", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleSidebarCards: ["welcome"],
        }),
      });
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "successful-registration"
      );
    });

    it("removes not-registered card and adds successful-registration card", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_FORM",
        }),
        preferences: generatePreferences({
          visibleSidebarCards: ["not-registered"],
        }),
      });

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "not-registered"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "successful-registration"
      );
    });

    it("leaves existing cards besides not registered when adding successful registration card", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_FORM",
        }),
        preferences: generatePreferences({
          visibleSidebarCards: ["welcome", "not-registered"],
        }),
      });

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "not-registered"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "successful-registration"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain("welcome");
    });
  });

  describe("formation nudge", () => {
    it("adds formation-nudge if operatingPhase is NEEDS_TO_FORM", () => {
      const taskId = formationTaskId;
      const userData = generateUserData({
        taskProgress: { [taskId]: "NOT_STARTED" },

        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_FORM",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [] }),
      });

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "formation-nudge"
      );
    });

    it("removes formation-nudge if  operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["formation-nudge"] }),
      });

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "formation-nudge"
      );
    });
  });

  describe("tax registration nudge", () => {
    it("adds registered-for-taxes-nudge when operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [] }),
      });
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "registered-for-taxes-nudge"
      );
    });

    it("removes registered-for-taxes-nudge when operatingPhase is FORMED_AND_REGISTERED", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "FORMED_AND_REGISTERED",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["registered-for-taxes-nudge"] }),
      });
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "registered-for-taxes-nudge"
      );
    });
  });

  describe("funding nudge", () => {
    it("adds funding-nudge when operatingPhase is FORMED_AND_REGISTERED", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "FORMED_AND_REGISTERED",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [] }),
      });
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "formation-nudge"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain("funding-nudge");
    });

    it("removes funding-nudge when operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["funding-nudge"] }),
      });
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "funding-nudge"
      );
    });
  });

  describe("welcome card", () => {
    const nonUpAndRunningOperatingPhases: OperatingPhaseId[] = [
      "GUEST_MODE",
      "GUEST_MODE_OWNING",
      "NEEDS_TO_FORM",
      "NEEDS_TO_REGISTER_FOR_TAXES",
      "FORMED_AND_REGISTERED",
    ];

    it.each<OperatingPhaseId>([...nonUpAndRunningOperatingPhases, "UP_AND_RUNNING", "UP_AND_RUNNING_OWNING"])(
      "does NOT re-add the welcome card when the visibleSidebarCards are empty",
      (operatingPhase) => {
        const userData = generateUserData({
          profileData: generateProfileData({
            operatingPhase: operatingPhase,
            industryId: "generic",
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        });
        const updatedUserData = updateSidebarCards(userData);
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
          "welcome-up-and-running"
        );
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain("welcome");
      }
    );

    it("adds the welcome-up-and-running card when operating phase is UP_AND_RUNNING_OWNING and removes the welcome card", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING_OWNING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["welcome"] }),
      });

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "welcome-up-and-running"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain("welcome");
    });

    it("does not remove welcome-up-and-running card when operating phase is UP_AND_RUNNING_OWNING", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING_OWNING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["welcome-up-and-running"] }),
      });

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "welcome-up-and-running"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain("welcome");
    });

    it("adds the welcome-up-and-running card when operating phase is UP_AND_RUNNING and removes the welcome card", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["welcome"] }),
      });

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "welcome-up-and-running"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain("welcome");
    });

    it("removes the welcome-up-and-running card and adds the welcome card back if the user reverts from UP_AND_RUNNING", () => {
      const revertedUserData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "FORMED_AND_REGISTERED",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["welcome-up-and-running"] }),
      });

      const updatedUserData = updateSidebarCards(revertedUserData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "welcome-up-and-running"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain("welcome");
    });

    for (const operatingPhase of nonUpAndRunningOperatingPhases) {
      it(`doesn't remove the generic welcome card when operating phase is ${operatingPhase}`, () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            operatingPhase: operatingPhase,
            industryId: "generic",
          }),
          preferences: generatePreferences({ visibleSidebarCards: ["welcome"] }),
        });

        const updatedUserData = updateSidebarCards(userData);
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain("welcome");
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
          "welcome-up-and-running"
        );
      });
    }
  });

  describe("go-to-profile nudge", () => {
    const poppyPhases: OperatingPhaseId[] = [
      "GUEST_MODE",
      "NEEDS_TO_FORM",
      "NEEDS_TO_REGISTER_FOR_TAXES",
      "FORMED_AND_REGISTERED",
      "UP_AND_RUNNING",
    ];

    const oscarPhases: OperatingPhaseId[] = ["GUEST_MODE_OWNING", "UP_AND_RUNNING_OWNING"];

    it.each(poppyPhases)("does not add go-to-profile nudge for %s", (operatingPhase) => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase,
          homeBasedBusiness: undefined,
        }),
        preferences: generatePreferences({ visibleSidebarCards: [] }),
      });
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "go-to-profile"
      );
    });

    it.each(oscarPhases)(
      "adds go-to-profile nudge for %s when at least one opportunity question unanswered",
      (operatingPhase) => {
        const userData = generateUserData({
          profileData: generateProfileData({
            operatingPhase,
            homeBasedBusiness: undefined,
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        });
        const updatedUserData = updateSidebarCards(userData);
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
          "go-to-profile"
        );
      }
    );

    it.each(oscarPhases)(
      "removes go-to-profile nudge for %s when all opportunity questions answered",
      (operatingPhase) => {
        const userData = generateUserData({
          profileData: generateProfileData({
            operatingPhase,
            homeBasedBusiness: true,
            dateOfFormation: "2020-01-01",
            municipality: generateMunicipality({}),
            ownershipTypeIds: ["none"],
            existingEmployees: "12",
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        });
        const updatedUserData = updateSidebarCards(userData);
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
          "go-to-profile"
        );
      }
    );
  });

  describe("when operatingPhase is UP_AND_RUNNING", () => {
    it("removes task-progress card", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["task-progress"] }),
      });

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "task-progress"
      );
    });
  });
});

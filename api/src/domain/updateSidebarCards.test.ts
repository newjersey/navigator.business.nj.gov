import { formationTaskId } from "@shared/domain-logic/taskIds";
import { generatePreferences, generateProfileData, generateUserData } from "../../test/factories";
import { updateSidebarCards } from "./updateSidebarCards";

describe("updateRoadmapSidebarCards", () => {
  describe("successful registration", () => {
    it("does not add successful-registration card if not-registered card does not exist", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleSidebarCards: ["welcome"],
        }),
      });
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).not.toContain(
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

      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).not.toContain("not-registered");
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).toContain(
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

      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).not.toContain("not-registered");
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).toContain(
        "successful-registration"
      );
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).toContain("welcome");
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

      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).toContain("formation-nudge");
    });

    it("removes formation-nudge if  operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["formation-nudge"] }),
      });

      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).not.toContain("formation-nudge");
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
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).toContain(
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
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).not.toContain(
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
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).not.toContain("formation-nudge");
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).toContain("funding-nudge");
    });

    it("removes funding-nudge when operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        preferences: generatePreferences({ visibleSidebarCards: ["funding-nudge"] }),
      });
      expect(updateSidebarCards(userData).preferences.visibleSidebarCards).not.toContain("funding-nudge");
    });
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
      expect(updatedUserData.preferences.visibleSidebarCards).not.toContain("task-progress");
    });
  });
});

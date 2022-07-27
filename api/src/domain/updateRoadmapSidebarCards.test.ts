import { formationTaskId } from "@shared/gradualGraduationStages";
import { generatePreferences, generateProfileData, generateUserData } from "../../test/factories";
import { updateRoadmapSidebarCards } from "./updateRoadmapSidebarCards";

describe("updateRoadmapSidebarCards", () => {
  describe("successful registration", () => {
    it("does not add successful-registration card if not-registered card does not exist", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["welcome"],
        }),
      });
      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).not.toContain(
        "successful-registration"
      );
    });

    it("removes not-registered card and adds successful-registration card", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_FORM",
        }),
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["not-registered"],
        }),
      });

      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).not.toContain(
        "not-registered"
      );
      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).toContain(
        "successful-registration"
      );
    });

    it("leaves existing cards besides not registered when adding successful registration card", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_FORM",
        }),
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["welcome", "not-registered"],
        }),
      });

      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).not.toContain(
        "not-registered"
      );
      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).toContain(
        "successful-registration"
      );
      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).toContain("welcome");
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
        preferences: generatePreferences({ visibleRoadmapSidebarCards: [] }),
      });

      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).toContain(
        "formation-nudge"
      );
    });

    it("removes formation-nudge if  operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        preferences: generatePreferences({ visibleRoadmapSidebarCards: ["formation-nudge"] }),
      });

      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).not.toContain(
        "formation-nudge"
      );
    });
  });

  describe("tax registration nudge", () => {
    it("adds tax-registration-nudge when operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        preferences: generatePreferences({ visibleRoadmapSidebarCards: [] }),
      });
      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).toContain(
        "tax-registration-nudge"
      );
    });

    it("removes tax-registration-nudge when operatingPhase is FORMED_AND_REGISTERED", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "FORMED_AND_REGISTERED",
        }),
        preferences: generatePreferences({ visibleRoadmapSidebarCards: ["tax-registration-nudge"] }),
      });
      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).not.toContain(
        "tax-registration-nudge"
      );
    });
  });
});

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
    it("adds formation-nudge for non-SP/GP if formation task is not completed", () => {
      const taskId = formationTaskId;
      const userData = generateUserData({
        taskProgress: { [taskId]: "NOT_STARTED" },
        profileData: generateProfileData({
          legalStructureId: "limited-liability-company",
        }),
        preferences: generatePreferences({ visibleRoadmapSidebarCards: [] }),
      });

      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).toContain(
        "formation-nudge"
      );
    });

    it("removes formation-nudge for non-SP/GP if formation task is completed", () => {
      const taskId = formationTaskId;
      const userData = generateUserData({
        taskProgress: { [taskId]: "COMPLETED" },
        profileData: generateProfileData({
          legalStructureId: "limited-liability-company",
        }),
        preferences: generatePreferences({ visibleRoadmapSidebarCards: ["formation-nudge"] }),
      });

      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).not.toContain(
        "formation-nudge"
      );
    });

    it("does not add formation-nudge for SP/GP", () => {
      const taskId = formationTaskId;
      const userData = generateUserData({
        taskProgress: { [taskId]: "COMPLETED" },
        profileData: generateProfileData({
          legalStructureId: "sole-proprietorship",
        }),
        preferences: generatePreferences({ visibleRoadmapSidebarCards: [] }),
      });

      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).not.toContain(
        "formation-nudge"
      );
    });
  });

  describe("tax registration nudge", () => {
    it("adds tax-registration-nudge if formation task is complete", () => {
      const taskId = formationTaskId;
      const userData = generateUserData({
        taskProgress: { [taskId]: "COMPLETED" },
        preferences: generatePreferences({ visibleRoadmapSidebarCards: [] }),
      });
      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).toContain(
        "tax-registration-nudge"
      );
    });

    it("removes tax-registration-nudge when register for taxes is complete", () => {
      const taskId = formationTaskId;
      const taxesTaskId = "register-for-taxes";

      const userData = generateUserData({
        taskProgress: { [taskId]: "COMPLETED", [taxesTaskId]: "COMPLETED" },
        preferences: generatePreferences({ visibleRoadmapSidebarCards: [] }),
      });
      expect(updateRoadmapSidebarCards(userData).preferences.visibleRoadmapSidebarCards).not.toContain(
        "tax-registration-nudge"
      );
    });
  });
});

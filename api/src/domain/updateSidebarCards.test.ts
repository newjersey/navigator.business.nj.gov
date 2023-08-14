import { formationTaskId } from "@shared/domain-logic/taskIds";
import { OperatingPhaseId } from "@shared/operatingPhase";
import {
  generateBusiness,
  generateMunicipality,
  generatePreferences,
  generateProfileData,
  generateUserDataForBusiness,
} from "@shared/test";
import { updateSidebarCards } from "./updateSidebarCards";

import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";

describe("updateRoadmapSidebarCards", () => {
  describe("not registered card", () => {
    it("removes not-registered card and adds formation nudge card", async () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: "NEEDS_TO_FORM",
          }),
          preferences: generatePreferences({
            visibleSidebarCards: ["not-registered"],
          }),
        })
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "not-registered"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "formation-nudge"
      );
    });

    it("leaves existing cards except for not registered when adding formation nudge card", async () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: "NEEDS_TO_FORM",
          }),
          preferences: generatePreferences({
            visibleSidebarCards: ["not-registered"],
          }),
        })
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "not-registered"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "formation-nudge"
      );
    });
  });

  describe("formation nudge", () => {
    it("adds formation-nudge if operatingPhase is NEEDS_TO_FORM", () => {
      const taskId = formationTaskId;
      const userData = generateUserDataForBusiness(
        generateBusiness({
          taskProgress: { [taskId]: "NOT_STARTED" },

          profileData: generateProfileData({
            operatingPhase: "NEEDS_TO_FORM",
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        })
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "formation-nudge"
      );
    });

    it("removes formation-nudge if  operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          }),
          preferences: generatePreferences({ visibleSidebarCards: ["formation-nudge"] }),
        })
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "formation-nudge"
      );
    });
  });

  describe("tax registration nudge", () => {
    it("adds registered-for-taxes-nudge when operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        })
      );
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "registered-for-taxes-nudge"
      );
    });

    it("removes registered-for-taxes-nudge when operatingPhase is FORMED_AND_REGISTERED", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: "FORMED_AND_REGISTERED",
          }),
          preferences: generatePreferences({ visibleSidebarCards: ["registered-for-taxes-nudge"] }),
        })
      );
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "registered-for-taxes-nudge"
      );
    });
  });

  describe("funding nudge", () => {
    it("adds funding-nudge when operatingPhase is FORMED_AND_REGISTERED", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: "FORMED_AND_REGISTERED",
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        })
      );
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "formation-nudge"
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain("funding-nudge");
    });

    it("removes funding-nudge when operatingPhase is NEEDS_TO_REGISTER_FOR_TAXES", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          }),
          preferences: generatePreferences({ visibleSidebarCards: ["funding-nudge"] }),
        })
      );
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "funding-nudge"
      );
    });
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
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase,
            homeBasedBusiness: undefined,
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        })
      );
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "go-to-profile"
      );
    });

    it.each(oscarPhases)(
      "adds go-to-profile nudge for %s when at least one opportunity question unanswered",
      (operatingPhase) => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              operatingPhase,
              homeBasedBusiness: undefined,
            }),
            preferences: generatePreferences({ visibleSidebarCards: [] }),
          })
        );
        const updatedUserData = updateSidebarCards(userData);
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
          "go-to-profile"
        );
      }
    );

    it.each(oscarPhases)(
      "removes go-to-profile nudge for %s when all opportunity questions answered",
      (operatingPhase) => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              operatingPhase,
              homeBasedBusiness: true,
              dateOfFormation: "2020-01-01",
              municipality: generateMunicipality({}),
              ownershipTypeIds: ["none"],
              existingEmployees: "12",
            }),
            preferences: generatePreferences({ visibleSidebarCards: [] }),
          })
        );
        const updatedUserData = updateSidebarCards(userData);
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
          "go-to-profile"
        );
      }
    );
  });

  describe("when operatingPhase is UP_AND_RUNNING", () => {
    it("removes task-progress card", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: "UP_AND_RUNNING",
            industryId: "generic",
          }),
          preferences: generatePreferences({ visibleSidebarCards: ["task-progress"] }),
        })
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        "task-progress"
      );
    });
  });
});

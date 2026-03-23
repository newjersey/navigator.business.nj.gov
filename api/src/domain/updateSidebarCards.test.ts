import { formationTaskId } from "@shared/domain-logic/taskIds";
import {
  generateBusiness,
  generatePreferences,
  generateProfileData,
  generateUserDataForBusiness,
} from "@shared/test";

import { updateSidebarCards } from "@domain/updateSidebarCards";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { SIDEBAR_CARDS } from "@shared/domain-logic/sidebarCards";
import { OperatingPhaseId } from "@shared/index";

const { formationNudge, fundingNudge, notRegistered, notRegisteredUpAndRunning } = SIDEBAR_CARDS;

describe("updateRoadmapSidebarCards", () => {
  describe("not registered card", () => {
    it("removes not-registered card and adds formation nudge card", async () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
          }),
          preferences: generatePreferences({
            visibleSidebarCards: [notRegistered],
          }),
        }),
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        notRegistered,
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        formationNudge,
      );
    });

    it("removes not-registered-up-and-running card and adds formation nudge card", async () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
          }),
          preferences: generatePreferences({
            visibleSidebarCards: [notRegisteredUpAndRunning],
          }),
        }),
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        notRegisteredUpAndRunning,
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        formationNudge,
      );
    });

    it("leaves existing cards except for not registered when adding formation nudge card", async () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
          }),
          preferences: generatePreferences({
            visibleSidebarCards: ["other-card", notRegistered],
          }),
        }),
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        notRegistered,
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        formationNudge,
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "other-card",
      );
    });

    it("leaves existing cards except for not-registered-up-and-running when adding formation nudge card", async () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
          }),
          preferences: generatePreferences({
            visibleSidebarCards: ["other-card", notRegisteredUpAndRunning],
          }),
        }),
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        notRegisteredUpAndRunning,
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        formationNudge,
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        "other-card",
      );
    });
  });

  describe("formation nudge", () => {
    it("adds formation-nudge if operatingPhase is NEEDS_TO_FORM", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          taskProgress: { [formationTaskId]: "TO_DO" },

          profileData: generateProfileData({
            operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        }),
      );

      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        formationNudge,
      );
    });

    const operatingPhasesWithNoFormationNudge = [
      OperatingPhaseId.GUEST_MODE,
      OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE,
      OperatingPhaseId.GUEST_MODE_OWNING,
      OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
      OperatingPhaseId.FORMED,
      OperatingPhaseId.UP_AND_RUNNING,
      OperatingPhaseId.UP_AND_RUNNING_OWNING,
      OperatingPhaseId.REMOTE_SELLER_WORKER,
    ];

    it.each(operatingPhasesWithNoFormationNudge)(
      "removes formation-nudge if operatingPhase is %s",
      (operatingPhase) => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              operatingPhase: operatingPhase as OperatingPhaseId,
            }),
            preferences: generatePreferences({ visibleSidebarCards: [formationNudge] }),
          }),
        );

        const updatedUserData = updateSidebarCards(userData);
        expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
          formationNudge,
        );
      },
    );
  });

  describe("funding nudge", () => {
    it("adds funding-nudge when operatingPhase is FORMED", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: OperatingPhaseId.FORMED,
          }),
          preferences: generatePreferences({ visibleSidebarCards: [] }),
        }),
      );
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        formationNudge,
      );
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).toContain(
        fundingNudge,
      );
    });

    it("removes funding-nudge when operatingPhase is NEEDS_TO_FORM", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
          }),
          preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
        }),
      );
      const updatedUserData = updateSidebarCards(userData);
      expect(getCurrentBusiness(updatedUserData).preferences.visibleSidebarCards).not.toContain(
        fundingNudge,
      );
    });
  });
});

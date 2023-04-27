/* eslint-disable unicorn/consistent-function-scoping */

import { formationTaskId, taxTaskId } from "@shared/domain-logic/taskIds";
import { generatePreferences, generateProfileData, generateUserData } from "@shared/test";
import { TaskProgress, UserData } from "@shared/userData";
import { updateOperatingPhase } from "./updateOperatingPhase";

describe("updateOperatingPhase", () => {
  describe("OWNING", () => {
    it("updates a GUEST_MODE to UP_AND_RUNNING_OWNING if it is not", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          operatingPhase: "GUEST_MODE",
        }),
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("UP_AND_RUNNING_OWNING");
    });

    it("updates a GUEST_MODE_OWNING to UP_AND_RUNNING_OWNING if it is not", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          operatingPhase: "GUEST_MODE_OWNING",
        }),
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("UP_AND_RUNNING_OWNING");
    });
  });

  describe("GUEST_MODE", () => {
    it("updates the phase to NEEDS_TO_FORM from GUEST_MODE for PublicFiling", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "GUEST_MODE",
          legalStructureId: "limited-partnership",
        }),
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates the phase to NEEDS_TO_REGISTER_FOR_TAXES from GUEST_MODE for TradeName", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "GUEST_MODE",
          legalStructureId: "general-partnership",
        }),
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });
  });

  describe("NEEDS_TO_FORM", () => {
    it("updates status to NEEDS_TO_REGISTER_FOR_TAXES when formation task is completed and PublicFiling legal structure", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_FORM",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [formationTaskId]: "COMPLETED" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });

    it("updates status to FORMED_AND_REGISTERED when formation task is completed and PublicFiling legal structure and tax task is complete", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_FORM",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [formationTaskId]: "COMPLETED", [taxTaskId]: "COMPLETED" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("FORMED_AND_REGISTERED");
    });

    it("updates status to NEEDS_TO_REGISTER_FOR_TAXES when formation task is not completed and TradeName legal structure", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_FORM",
          legalStructureId: "general-partnership",
        }),
        taskProgress: { [formationTaskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });
  });

  describe("NEEDS_TO_REGISTER_FOR_TAXES", () => {
    it("updates status to FORMED_AND_REGISTERED when tax task and formation task is completed", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        taskProgress: { [taxTaskId]: "COMPLETED", [formationTaskId]: "COMPLETED" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("FORMED_AND_REGISTERED");
    });

    it("updates status to NEEDS_TO_FORM when formation task is not completed and legal structure requires public filing", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [formationTaskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates status to NEEDS_TO_FORM when formation task has no status and legal structure requires public filing", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [taxTaskId]: "COMPLETED" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("does not update status from NEEDS_TO_REGISTER_FOR_TAXES when formation task is not completed and legal structure does not require public filing", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: "general-partnership",
        }),
        taskProgress: { [formationTaskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });
  });

  describe("FORMED_AND_REGISTERED", () => {
    it("updates status back to NEEDS_TO_REGISTER_FOR_TAXES if tax task is not completed", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "FORMED_AND_REGISTERED",
        }),
        taskProgress: { [formationTaskId]: "COMPLETED", [taxTaskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });

    it("updates status back to NEEDS_TO_FORM if tax task and formation task is not completed", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "FORMED_AND_REGISTERED",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [formationTaskId]: "IN_PROGRESS", [taxTaskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates status back to NEEDS_TO_FORM if tax task is completed and formation task is not completed", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "FORMED_AND_REGISTERED",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [formationTaskId]: "IN_PROGRESS", [taxTaskId]: "COMPLETED" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });
  });

  describe("UP_AND_RUNNING", () => {
    describe("public filing legal structure", () => {
      const getUserData = (taskProgress: Record<string, TaskProgress>): UserData => {
        return generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: "UP_AND_RUNNING",
            legalStructureId: "limited-liability-company",
          }),
          taskProgress: taskProgress,
          preferences: generatePreferences({ isHideableRoadmapOpen: true }),
        });
      };

      describe("when tax complete, formation incomplete", () => {
        it("sets back to NEEDS_TO_FORM (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({ [formationTaskId]: "IN_PROGRESS", [taxTaskId]: "COMPLETED" });
          expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
          expect(updateOperatingPhase(userData).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });

      describe("when tax incomplete, formation incomplete", () => {
        it("sets back to NEEDS_TO_FORM (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({ [formationTaskId]: "IN_PROGRESS", [taxTaskId]: "IN_PROGRESS" });
          expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
          expect(updateOperatingPhase(userData).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });

      describe("when tax incomplete, formation complete", () => {
        it("sets back to NEEDS_TO_REGISTER_FOR_TAXES (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({ [formationTaskId]: "COMPLETED", [taxTaskId]: "IN_PROGRESS" });
          expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe(
            "NEEDS_TO_REGISTER_FOR_TAXES"
          );
          expect(updateOperatingPhase(userData).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });
    });

    describe("trade name legal structure", () => {
      const getUserData = (taskProgress: Record<string, TaskProgress>): UserData => {
        return generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: "UP_AND_RUNNING",
            legalStructureId: "general-partnership",
          }),
          taskProgress: taskProgress,
          preferences: generatePreferences({ isHideableRoadmapOpen: true }),
        });
      };

      describe("when tax incomplete", () => {
        it("sets back to NEEDS_TO_REGISTER_FOR_TAXES (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({ [taxTaskId]: "IN_PROGRESS" });
          expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe(
            "NEEDS_TO_REGISTER_FOR_TAXES"
          );
          expect(updateOperatingPhase(userData).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });
    });
  });

  it("sets phaseNewlyChanged in preferences if phase has changed", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        operatingPhase: "GUEST_MODE",
        legalStructureId: "limited-partnership",
      }),
      preferences: generatePreferences({ phaseNewlyChanged: false }),
    });
    const updatedData = updateOperatingPhase(userData);
    expect(updatedData.profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    expect(updatedData.preferences.phaseNewlyChanged).toBe(true);
  });

  it("keeps existing value of phaseNewlyChanged if phase did not changed", () => {
    const userData1 = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        legalStructureId: "general-partnership",
      }),
      taskProgress: { [formationTaskId]: "IN_PROGRESS" },
      preferences: generatePreferences({ phaseNewlyChanged: false }),
    });
    const updatedData1 = updateOperatingPhase(userData1);
    expect(updatedData1.profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    expect(updatedData1.preferences.phaseNewlyChanged).toBe(false);

    const userData2 = generateUserData({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        legalStructureId: "general-partnership",
      }),
      taskProgress: { [formationTaskId]: "IN_PROGRESS" },
      preferences: generatePreferences({ phaseNewlyChanged: true }),
    });
    const updatedData2 = updateOperatingPhase(userData2);
    expect(updatedData2.profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    expect(updatedData2.preferences.phaseNewlyChanged).toBe(true);
  });
});

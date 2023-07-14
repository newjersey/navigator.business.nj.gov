/* eslint-disable unicorn/consistent-function-scoping */

import { businessStructureTaskId, formationTaskId, taxTaskId } from "@shared/domain-logic/taskIds";
import { generatePreferences, generateProfileData, generateUserDataPrime } from "@shared/test";
import { UserDataPrime } from "@shared/userData";
import { updateOperatingPhase } from "./updateOperatingPhase";

import { TaskProgress } from "@shared/business";
import { getCurrentBusiness } from "@shared/businessHelpers";

describe("updateOperatingPhase", () => {
  describe("OWNING", () => {
    it("updates a GUEST_MODE to UP_AND_RUNNING_OWNING if it is not", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          operatingPhase: "GUEST_MODE",
        }),
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("UP_AND_RUNNING_OWNING");
    });

    it("updates a GUEST_MODE_OWNING to UP_AND_RUNNING_OWNING if it is not", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          operatingPhase: "GUEST_MODE_OWNING",
        }),
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("UP_AND_RUNNING_OWNING");
    });
  });

  describe("GUEST_MODE", () => {
    it("updates the phase to NEEDS_BUSINESS_STRUCTURE from GUEST_MODE", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "GUEST_MODE",
        }),
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_BUSINESS_STRUCTURE");
    });

    it("updates the phase to NEEDS_BUSINESS_STRUCTURE from GUEST_MODE for nexus", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          operatingPhase: "GUEST_MODE",
        }),
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_BUSINESS_STRUCTURE");
    });

    it("updates to NEEDS_TO_FORM from GUEST_MODE when user is remote seller", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "REMOTE_SELLER",
          operatingPhase: "GUEST_MODE",
        }),
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates to NEEDS_TO_FORM from GUEST_MODE when user is remote worker", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "REMOTE_WORKER",
          operatingPhase: "GUEST_MODE",
        }),
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });
  });

  describe("NEEDS_BUSINESS_STRUCTURE", () => {
    it("updates the phase to NEEDS_TO_FORM from NEEDS_BUSINESS_STRUCTURE for PublicFiling", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_BUSINESS_STRUCTURE",
          legalStructureId: "limited-partnership",
        }),
        taskProgress: { [businessStructureTaskId]: "COMPLETED" },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates the phase to NEEDS_TO_REGISTER_FOR_TAXES from NEEDS_BUSINESS_STRUCTURE for TradeName", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_BUSINESS_STRUCTURE",
          legalStructureId: "general-partnership",
        }),
        taskProgress: { [businessStructureTaskId]: "COMPLETED" },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });

    it("updates status to FORMED_AND_REGISTERED when formation and business structure tasks are completed and PublicFiling legal structure and tax task is complete", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_BUSINESS_STRUCTURE",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: {
          [formationTaskId]: "COMPLETED",
          [taxTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("FORMED_AND_REGISTERED");
    });

    it("updates status to FORMED_AND_REGISTERED when business structure and tax tasks are completed for TradeName", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_BUSINESS_STRUCTURE",
          legalStructureId: "general-partnership",
        }),
        taskProgress: {
          [taxTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("FORMED_AND_REGISTERED");
    });
  });

  describe("NEEDS_TO_FORM", () => {
    it("updates status to NEEDS_TO_REGISTER_FOR_TAXES when formation and business structure tasks are completed and PublicFiling legal structure", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_FORM",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [formationTaskId]: "COMPLETED", [businessStructureTaskId]: "COMPLETED" },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });

    it("updates status to FORMED_AND_REGISTERED when formation and business structure tasks are completed and PublicFiling legal structure and tax task is complete", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_FORM",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: {
          [formationTaskId]: "COMPLETED",
          [taxTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("FORMED_AND_REGISTERED");
    });

    it("updates status to NEEDS_TO_REGISTER_FOR_TAXES when formation task is not completed and TradeName legal structure", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_FORM",
          legalStructureId: "general-partnership",
        }),
        taskProgress: { [taxTaskId]: "IN_PROGRESS", [businessStructureTaskId]: "COMPLETED" },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });

    it("updates status back to NEEDS_BUSINESS_STRUCTURE if business structure task is not completed and legalStructureId is undefined", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_FORM",
          legalStructureId: undefined,
        }),
        taskProgress: {
          [businessStructureTaskId]: "IN_PROGRESS",
          [formationTaskId]: "COMPLETED",
          [taxTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_BUSINESS_STRUCTURE");
    });
  });

  describe("NEEDS_TO_REGISTER_FOR_TAXES", () => {
    it("updates status to FORMED_AND_REGISTERED when tax, formation, and business structure task are completed", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        taskProgress: {
          [taxTaskId]: "COMPLETED",
          [formationTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("FORMED_AND_REGISTERED");
    });

    it("updates status to NEEDS_TO_FORM when formation task is not completed and legal structure requires public filing", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [formationTaskId]: "IN_PROGRESS", [businessStructureTaskId]: "COMPLETED" },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates status to NEEDS_TO_FORM when formation task has no status and legal structure requires public filing", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [taxTaskId]: "COMPLETED", [businessStructureTaskId]: "COMPLETED" },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("does not update status from NEEDS_TO_REGISTER_FOR_TAXES when formation task is not completed and legal structure does not require public filing", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: "general-partnership",
        }),
        taskProgress: { [formationTaskId]: "IN_PROGRESS", [businessStructureTaskId]: "COMPLETED" },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });

    it("updates status back to NEEDS_BUSINESS_STRUCTURE if business structure task is not completed and legalStructureId is undefined", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: undefined,
        }),
        taskProgress: {
          [businessStructureTaskId]: "IN_PROGRESS",
          [formationTaskId]: "COMPLETED",
          [taxTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_BUSINESS_STRUCTURE");
    });
  });

  describe("FORMED_AND_REGISTERED", () => {
    it("updates status back to NEEDS_BUSINESS_STRUCTURE if business structure task is not completed and legalStructureId is undefined", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "FORMED_AND_REGISTERED",
          legalStructureId: undefined,
        }),
        taskProgress: {
          [formationTaskId]: "COMPLETED",
          [taxTaskId]: "COMPLETED",
          [businessStructureTaskId]: "IN_PROGRESS",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_BUSINESS_STRUCTURE");
    });

    it("updates status back to NEEDS_TO_REGISTER_FOR_TAXES if tax task is not completed", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "FORMED_AND_REGISTERED",
        }),
        taskProgress: {
          [formationTaskId]: "COMPLETED",
          [taxTaskId]: "IN_PROGRESS",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });

    it("updates status back to NEEDS_TO_FORM if tax task and formation task is not completed", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "FORMED_AND_REGISTERED",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: {
          [formationTaskId]: "IN_PROGRESS",
          [taxTaskId]: "IN_PROGRESS",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates status back to NEEDS_TO_FORM if tax and business structure task is completed and formation task is not completed", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "FORMED_AND_REGISTERED",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: {
          [formationTaskId]: "IN_PROGRESS",
          [taxTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });
  });

  describe("UP_AND_RUNNING", () => {
    describe("undefined legal structure", () => {
      describe("when tax and formation complete, but business structure is not incomplete and legalStructureId is undefined", () => {
        const getUserData = (taskProgress: Record<string, TaskProgress>): UserDataPrime => {
          return generateUserDataPrime({
            profileData: generateProfileData({
              businessPersona: "STARTING",
              operatingPhase: "UP_AND_RUNNING",
              legalStructureId: undefined,
            }),
            taskProgress: taskProgress,
            preferences: generatePreferences({ isHideableRoadmapOpen: true }),
          });
        };

        it("sets back to NEEDS_BUSINESS_STRUCTURE (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({
            [formationTaskId]: "COMPLETED",
            [taxTaskId]: "COMPLETED",
            [businessStructureTaskId]: "IN_PROGRESS",
          });

          const result = updateOperatingPhase(userData);
          expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_BUSINESS_STRUCTURE");
          expect(getCurrentBusiness(result).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });
    });

    describe("public filing legal structure", () => {
      const getUserData = (taskProgress: Record<string, TaskProgress>): UserDataPrime => {
        return generateUserDataPrime({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: "UP_AND_RUNNING",
            legalStructureId: "limited-liability-company",
          }),
          taskProgress: taskProgress,
          preferences: generatePreferences({ isHideableRoadmapOpen: true }),
        });
      };

      describe("when tax and business structure complete, but formation incomplete", () => {
        it("sets back to NEEDS_TO_FORM (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({
            [formationTaskId]: "IN_PROGRESS",
            [taxTaskId]: "COMPLETED",
            [businessStructureTaskId]: "COMPLETED",
          });

          const result = updateOperatingPhase(userData);
          expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
          expect(getCurrentBusiness(result).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });

      describe("when tax and formation incomplete but business structure complete", () => {
        it("sets back to NEEDS_TO_FORM (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({
            [formationTaskId]: "IN_PROGRESS",
            [taxTaskId]: "IN_PROGRESS",
            [businessStructureTaskId]: "COMPLETED",
          });

          const result = updateOperatingPhase(userData);
          expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
          expect(getCurrentBusiness(result).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });

      describe("when tax incomplete, but formation and business structure complete", () => {
        it("sets back to NEEDS_TO_REGISTER_FOR_TAXES (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({
            [formationTaskId]: "COMPLETED",
            [taxTaskId]: "IN_PROGRESS",
            [businessStructureTaskId]: "COMPLETED",
          });

          const result = updateOperatingPhase(userData);
          expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
          expect(getCurrentBusiness(result).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });
    });

    describe("trade name legal structure", () => {
      const getUserData = (taskProgress: Record<string, TaskProgress>): UserDataPrime => {
        return generateUserDataPrime({
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
          const userData = getUserData({
            [taxTaskId]: "IN_PROGRESS",
            [businessStructureTaskId]: "COMPLETED",
          });

          const result = updateOperatingPhase(userData);
          expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
          expect(getCurrentBusiness(result).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });
    });

    it("does not update status to FORMED_AND_REGISTERED when all tasks are complete for public filing legal structure", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "UP_AND_RUNNING",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: {
          [formationTaskId]: "COMPLETED",
          [taxTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("UP_AND_RUNNING");
    });

    it("does not update status to FORMED_AND_REGISTERED when all tasks are complete for trade name legal structure", () => {
      const userData = generateUserDataPrime({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: "UP_AND_RUNNING",
          legalStructureId: "general-partnership",
        }),
        taskProgress: {
          [formationTaskId]: "COMPLETED",
          [taxTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe("UP_AND_RUNNING");
    });
  });

  it("sets phaseNewlyChanged in preferences if phase has changed", () => {
    const userData = generateUserDataPrime({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        operatingPhase: "GUEST_MODE",
      }),
      preferences: generatePreferences({ phaseNewlyChanged: false }),
    });
    const updatedData = updateOperatingPhase(userData);
    expect(getCurrentBusiness(updatedData).profileData.operatingPhase).toBe("NEEDS_BUSINESS_STRUCTURE");
    expect(getCurrentBusiness(updatedData).preferences.phaseNewlyChanged).toBe(true);
  });

  it("keeps existing value of phaseNewlyChanged if phase did not changed", () => {
    const userData1 = generateUserDataPrime({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        legalStructureId: "general-partnership",
      }),
      taskProgress: { [formationTaskId]: "IN_PROGRESS", [businessStructureTaskId]: "COMPLETED" },
      preferences: generatePreferences({ phaseNewlyChanged: false }),
    });
    const updatedData1 = updateOperatingPhase(userData1);
    expect(getCurrentBusiness(updatedData1).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    expect(getCurrentBusiness(updatedData1).preferences.phaseNewlyChanged).toBe(false);

    const userData2 = generateUserDataPrime({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        legalStructureId: "general-partnership",
      }),
      taskProgress: { [formationTaskId]: "IN_PROGRESS", [businessStructureTaskId]: "COMPLETED" },
      preferences: generatePreferences({ phaseNewlyChanged: true }),
    });
    const updatedData2 = updateOperatingPhase(userData2);
    expect(getCurrentBusiness(updatedData2).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    expect(getCurrentBusiness(updatedData2).preferences.phaseNewlyChanged).toBe(true);
  });
});

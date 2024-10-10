/* eslint-disable unicorn/consistent-function-scoping */

import { businessStructureTaskId, formationTaskId, taxTaskId } from "@shared/domain-logic/taskIds";
import {
  generateBusiness,
  generateOwningProfileData,
  generatePreferences,
  generateProfileData,
  generateUserDataForBusiness,
} from "@shared/test";
import { TaskProgress, UserData } from "@shared/userData";

import { updateOperatingPhase } from "@domain/user/updateOperatingPhase";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { OperatingPhaseId } from "@shared/operatingPhase";

describe("updateOperatingPhase", () => {
  describe("OWNING", () => {
    it("updates a GUEST_MODE to UP_AND_RUNNING_OWNING if it is not", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateOwningProfileData({
            operatingPhase: OperatingPhaseId.GUEST_MODE,
          }),
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.UP_AND_RUNNING_OWNING
      );
    });

    it("updates a GUEST_MODE_OWNING to UP_AND_RUNNING_OWNING if it is not", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateOwningProfileData({
            operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
          }),
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.UP_AND_RUNNING_OWNING
      );
    });
  });

  describe("GUEST_MODE", () => {
    it("updates the phase to NEEDS_BUSINESS_STRUCTURE from GUEST_MODE", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.GUEST_MODE,
          }),
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE
      );
    });

    it("updates the phase to NEEDS_BUSINESS_STRUCTURE from GUEST_MODE for nexus", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            operatingPhase: OperatingPhaseId.GUEST_MODE,
            foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
          }),
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE
      );
    });

    it("updates to REMOTE_SELLER_WORKER from GUEST_MODE when user is remote seller", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessTypeIds: ["revenueInNJ"],
            operatingPhase: OperatingPhaseId.GUEST_MODE,
          }),
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.REMOTE_SELLER_WORKER
      );
    });

    it("updates to REMOTE_SELLER_WORKER from GUEST_MODE when user is remote worker", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessTypeIds: ["employeesInNJ"],
            operatingPhase: OperatingPhaseId.GUEST_MODE,
          }),
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.REMOTE_SELLER_WORKER
      );
    });

    it("updates to DOMESTIC_EMPLOYER from GUEST_MODE when industry is domestic-employer", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            industryId: "domestic-employer",
            operatingPhase: OperatingPhaseId.GUEST_MODE,
          }),
        })
      );
      const updatedOpPhase = updateOperatingPhase(userData);
      expect(getCurrentBusiness(updatedOpPhase).profileData.operatingPhase).toBe(
        OperatingPhaseId.DOMESTIC_EMPLOYER
      );
    });
  });

  describe("NEEDS_BUSINESS_STRUCTURE", () => {
    it("updates status to NEEDS_TO_FORM when business structure task is completed and PublicFiling legal structure", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
            legalStructureId: "limited-partnership",
          }),
          taskProgress: { [businessStructureTaskId]: "COMPLETED" },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.NEEDS_TO_FORM);
    });

    it("updates status to FORMED when formation and business structure tasks are completed and PublicFiling legal structure", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
            legalStructureId: "limited-liability-company",
          }),
          taskProgress: {
            [formationTaskId]: "COMPLETED",
            [businessStructureTaskId]: "COMPLETED",
          },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.FORMED);
    });

    it("updates status to FORMED when business structure is completed for TradeName", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
            legalStructureId: "general-partnership",
          }),
          taskProgress: {
            [businessStructureTaskId]: "COMPLETED",
          },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.FORMED);
    });
  });

  describe("NEEDS_TO_FORM", () => {
    it("updates status back to NEEDS_BUSINESS_STRUCTURE if business structure task is not completed and legalStructureId is undefined", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
            legalStructureId: undefined,
          }),
          taskProgress: {
            [businessStructureTaskId]: "IN_PROGRESS",
            [formationTaskId]: "COMPLETED",
            [taxTaskId]: "COMPLETED",
          },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE
      );
    });

    it("updates status to FORMED when formation and business structure task are completed", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
          }),
          taskProgress: {
            [formationTaskId]: "COMPLETED",
            [businessStructureTaskId]: "COMPLETED",
          },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.FORMED);
    });
  });

  describe("FORMED", () => {
    it("updates status back to NEEDS_BUSINESS_STRUCTURE if business structure task is not completed and legalStructureId is undefined", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.FORMED,
            legalStructureId: undefined,
          }),
          taskProgress: {
            [formationTaskId]: "COMPLETED",
            [businessStructureTaskId]: "IN_PROGRESS",
          },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE
      );
    });

    it("updates status back to NEEDS_TO_FORM if business structure task is completed, formation task is not completed and legal structure requires public filing", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.FORMED,
            legalStructureId: "limited-liability-company",
          }),
          taskProgress: {
            [formationTaskId]: "IN_PROGRESS",
            [businessStructureTaskId]: "COMPLETED",
          },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.NEEDS_TO_FORM);
    });

    it("updates status back to NEEDS_TO_FORM when formation task has no status and legal structure requires public filing", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.FORMED,
            legalStructureId: "limited-liability-company",
          }),
          taskProgress: { [businessStructureTaskId]: "COMPLETED" },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.NEEDS_TO_FORM);
    });
  });

  describe("UP_AND_RUNNING", () => {
    describe("undefined legal structure", () => {
      describe("when tax and formation complete, but business structure is not incomplete and legalStructureId is undefined", () => {
        const getUserData = (taskProgress: Record<string, TaskProgress>): UserData => {
          return generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "STARTING",
                operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
                legalStructureId: undefined,
              }),
              taskProgress: taskProgress,
              preferences: generatePreferences({ isHideableRoadmapOpen: true }),
            })
          );
        };

        it("sets back to NEEDS_BUSINESS_STRUCTURE (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({
            [formationTaskId]: "COMPLETED",
            [taxTaskId]: "COMPLETED",
            [businessStructureTaskId]: "IN_PROGRESS",
          });

          const result = updateOperatingPhase(userData);
          expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
            OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE
          );
          expect(getCurrentBusiness(result).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });
    });

    describe("public filing legal structure", () => {
      const getUserData = (taskProgress: Record<string, TaskProgress>): UserData => {
        return generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              businessPersona: "STARTING",
              operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
              legalStructureId: "limited-liability-company",
            }),
            taskProgress: taskProgress,
            preferences: generatePreferences({ isHideableRoadmapOpen: true }),
          })
        );
      };

      describe("when business structure complete, but formation incomplete", () => {
        it("sets back to NEEDS_TO_FORM (and sets hideableRoadmap to false)", () => {
          const userData = getUserData({
            [formationTaskId]: "IN_PROGRESS",
            [businessStructureTaskId]: "COMPLETED",
          });

          const result = updateOperatingPhase(userData);
          expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.NEEDS_TO_FORM);
          expect(getCurrentBusiness(result).preferences.isHideableRoadmapOpen).toBe(false);
        });
      });
    });

    it("does not update status back to FORMED when all tasks are complete for public filing legal structure", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
            legalStructureId: "limited-liability-company",
          }),
          taskProgress: {
            [formationTaskId]: "COMPLETED",
            [taxTaskId]: "COMPLETED",
            [businessStructureTaskId]: "COMPLETED",
          },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.UP_AND_RUNNING);
    });

    it("does not update status back to FORMED when all tasks are complete for trade name legal structure", () => {
      const userData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
            legalStructureId: "general-partnership",
          }),
          taskProgress: {
            [formationTaskId]: "COMPLETED",
            [taxTaskId]: "COMPLETED",
            [businessStructureTaskId]: "COMPLETED",
          },
        })
      );
      const result = updateOperatingPhase(userData);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.UP_AND_RUNNING);
    });
  });

  it("sets phaseNewlyChanged in preferences if phase has changed", () => {
    const userData = generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.GUEST_MODE,
        }),
        preferences: generatePreferences({ phaseNewlyChanged: false }),
      })
    );
    const updatedData = updateOperatingPhase(userData);
    expect(getCurrentBusiness(updatedData).profileData.operatingPhase).toBe(
      OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE
    );
    expect(getCurrentBusiness(updatedData).preferences.phaseNewlyChanged).toBe(true);
  });

  it("keeps existing value of phaseNewlyChanged if phase did not changed", () => {
    const userData1 = generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.FORMED,
          legalStructureId: "general-partnership",
        }),
        taskProgress: { [formationTaskId]: "COMPLETED", [businessStructureTaskId]: "COMPLETED" },
        preferences: generatePreferences({ phaseNewlyChanged: false }),
      })
    );
    const updatedData1 = updateOperatingPhase(userData1);
    expect(getCurrentBusiness(updatedData1).profileData.operatingPhase).toBe(OperatingPhaseId.FORMED);
    expect(getCurrentBusiness(updatedData1).preferences.phaseNewlyChanged).toBe(false);

    const userData2 = generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.FORMED,
          legalStructureId: "general-partnership",
        }),
        taskProgress: { [formationTaskId]: "COMPLETED", [businessStructureTaskId]: "COMPLETED" },
        preferences: generatePreferences({ phaseNewlyChanged: true }),
      })
    );
    const updatedData2 = updateOperatingPhase(userData2);
    expect(getCurrentBusiness(updatedData2).profileData.operatingPhase).toBe(OperatingPhaseId.FORMED);
    expect(getCurrentBusiness(updatedData2).preferences.phaseNewlyChanged).toBe(true);
  });
});

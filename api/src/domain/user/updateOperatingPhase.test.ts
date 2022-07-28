import { formationTaskId } from "@shared/gradualGraduationStages";
import { generateProfileData, generateUserData } from "../../../test/factories";
import { updateOperatingPhase } from "./updateOperatingPhase";

describe("updateOperatingPhase", () => {
  describe("GUEST_MODE", () => {
    it("updates the phase to NEEDS_TO_FORM from GUEST_MODE for public filing companies", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "GUEST_MODE",
          legalStructureId: "limited-partnership",
        }),
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates the phase to NEEDS_TO_REGISTER_FOR_TAXES from GUEST_MODE for nonpublic filing companies", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "GUEST_MODE",
          legalStructureId: "general-partnership",
        }),
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });
  });

  describe("NEEDS_TO_FORM", () => {
    it("updates status to NEEDS_TO_REGISTER_FOR_TAXES when formation task is completed and legal structure requires public filing", () => {
      const taskId = formationTaskId;
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_FORM",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [taskId]: "COMPLETED" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });
  });

  describe("NEEDS_TO_REGISTER_FOR_TAXES", () => {
    it("updates status to FORMED_AND_REGISTERED when tax task is completed", () => {
      const taxesTaskId = "register-for-taxes";
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
        }),
        taskProgress: { [taxesTaskId]: "COMPLETED" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("FORMED_AND_REGISTERED");
    });

    it("updates status to NEEDS_TO_FORM when formation task is not completed and legal structure requires public filing", () => {
      const taskId = formationTaskId;
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [taskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("does not update status from NEEDS_TO_REGISTER_FOR_TAXES when formation task is not completed and legal structure does not require public filing", () => {
      const taskId = formationTaskId;
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          legalStructureId: "general-partnership",
        }),
        taskProgress: { [taskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });
  });

  describe("FORMED_AND_REGISTERED", () => {
    it("updates status back to NEEDS_TO_REGISTER_FOR_TAXES if tax task is not completed", () => {
      const taskId = formationTaskId;
      const taxesTaskId = "register-for-taxes";

      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "FORMED_AND_REGISTERED",
        }),
        taskProgress: { [taskId]: "COMPLETED", [taxesTaskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_REGISTER_FOR_TAXES");
    });

    it("updates status back to NEEDS_TO_FORM if tax task and formation task is not completed", () => {
      const taskId = formationTaskId;
      const taxesTaskId = "register-for-taxes";

      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "FORMED_AND_REGISTERED",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [taskId]: "IN_PROGRESS", [taxesTaskId]: "IN_PROGRESS" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });

    it("updates status back to NEEDS_TO_FORM if tax task is completed and formation task is not completed", () => {
      const taskId = formationTaskId;
      const taxesTaskId = "register-for-taxes";

      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "FORMED_AND_REGISTERED",
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: { [taskId]: "IN_PROGRESS", [taxesTaskId]: "COMPLETED" },
      });
      expect(updateOperatingPhase(userData).profileData.operatingPhase).toBe("NEEDS_TO_FORM");
    });
  });
});

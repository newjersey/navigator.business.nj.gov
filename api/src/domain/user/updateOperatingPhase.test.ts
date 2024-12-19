/* eslint-disable unicorn/consistent-function-scoping */

import { businessStructureTaskId, formationTaskId } from "@shared/domain-logic/taskIds";
import {
  generateBusiness,
  generateOwningProfileData,
  generateProfileData,
  generateStartingProfileData,
  generateUserData,
  generateUserDataForBusiness,
} from "@shared/test";

import { updateOperatingPhase } from "@domain/user/updateOperatingPhase";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { randomInt } from "@shared/intHelpers";
import { OperatingPhaseId } from "@shared/operatingPhase";
import { ProfileData } from "@shared/profileData";

describe("updateOperatingPhase", () => {
  describe("Owning", () => {
    it("updates OWNING business persona to UP_AND_RUNNING_OWNING operatingPhase", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateOwningProfileData({}),
      });

      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.UP_AND_RUNNING_OWNING
      );
    });
  });

  describe("Foreign", () => {
    it("updates Remote Seller / Worker Foreign business persona to REMOTE_SELLER_WORKER operatingPhase", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeesInNJ", "revenueInNJ", "transactionsInNJ"],
        }),
      });

      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.REMOTE_SELLER_WORKER
      );
    });
  });

  describe("Starting", () => {
    it("updates Domestic Employer industry to DOMESTIC_EMPLOYER operatingPhase", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateStartingProfileData({
          industryId: "domestic-employer",
        }),
      });
      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.DOMESTIC_EMPLOYER);
    });
  });

  describe("Starting / Foreign", () => {
    it("updates to NEEDS_TO_FORM operatingPhase when public filing business structure is selected", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: randomInt() % 2 ? "STARTING" : "FOREIGN",
          operatingPhase: OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: {
          [businessStructureTaskId]: "COMPLETED",
        },
      });

      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.NEEDS_TO_FORM);
    });

    it("updates to FORMED operatingPhase when public filing business structure is selected and formed", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: randomInt() % 2 ? "STARTING" : "FOREIGN",
          operatingPhase: OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: {
          [formationTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });

      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);

      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.FORMED);
    });

    it("updates to FORMED operatingPhase when not a public filing business structure is selected", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: randomInt() % 2 ? "STARTING" : "FOREIGN",
          operatingPhase: OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
          legalStructureId: "sole-proprietorship",
        }),
        taskProgress: {
          [businessStructureTaskId]: "COMPLETED",
        },
      });

      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);

      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.FORMED);
    });

    it("stays in UP_AND_RUNNING operatingPhase when public filing business structure is selected and formed", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: randomInt() % 2 ? "STARTING" : "FOREIGN",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
          legalStructureId: "limited-liability-company",
        }),
        taskProgress: {
          [formationTaskId]: "COMPLETED",
          [businessStructureTaskId]: "COMPLETED",
        },
      });

      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.UP_AND_RUNNING);
    });

    it("stays in UP_AND_RUNNING operatingPhase when not a public filing business structure is selected", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: randomInt() % 2 ? "STARTING" : "FOREIGN",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
          legalStructureId: "sole-proprietorship",
        }),
        taskProgress: {
          [businessStructureTaskId]: "COMPLETED",
        },
      });

      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(OperatingPhaseId.UP_AND_RUNNING);
    });

    it("updates GUEST_MODE operatingPhase to NEEDS_BUSINESS_STRUCTURE operatingPhase", () => {
      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          businessPersona: randomInt() % 2 ? "STARTING" : "FOREIGN",
          operatingPhase: OperatingPhaseId.GUEST_MODE,
        }),
      });

      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);
      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE
      );
    });

    it("updates to NEEDS_BUSINESS_STRUCTURE operatingPhase when legal structure task is not complete and legal structure is undefined", () => {
      const startingOrForeign: Partial<ProfileData> =
        randomInt() % 2
          ? { businessPersona: "STARTING" }
          : { businessPersona: "FOREIGN", foreignBusinessTypeIds: ["officeInNJ"] };

      const userData = generateUserData({});
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          ...startingOrForeign,
          operatingPhase: OperatingPhaseId.FORMED,
          legalStructureId: undefined,
        }),
        taskProgress: {
          [businessStructureTaskId]: "NOT_STARTED",
        },
      });
      const userDataForBusiness = generateUserDataForBusiness(business);
      const result = updateOperatingPhase(userDataForBusiness);

      expect(getCurrentBusiness(result).profileData.operatingPhase).toBe(
        OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE
      );
    });
  });
});

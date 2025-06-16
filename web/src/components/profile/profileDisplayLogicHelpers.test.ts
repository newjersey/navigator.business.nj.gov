import {
  displayElevatorQuestion,
  displayHomedBaseBusinessQuestion,
  displayPlannedRenovationQuestion,
} from "@/components/profile/profileDisplayLogicHelpers";
import { NexusBusinessTypeIds } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { getIndustries } from "@businessnjgovnavigator/shared/industry";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test/factories";
import { createEmptyBusiness } from "@businessnjgovnavigator/shared/userData";

describe("profileDisplayLogicHelpers", () => {
  describe("home based business question", () => {
    it("returns false if no business is provided", () => {
      expect(displayHomedBaseBusinessQuestion(createEmptyProfileData())).toBe(false);
    });

    it("returns true if the profile data doesn't have an industry", () => {
      const business = createEmptyBusiness({ userId: "user-id" });
      expect(displayHomedBaseBusinessQuestion(business.profileData, business)).toBe(true);
    });

    it("returns false if the business is nexus and has location in NJ", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: NexusBusinessTypeIds,
        }),
      });
      expect(displayHomedBaseBusinessQuestion(business.profileData, business)).toBe(false);
    });

    it("returns true if the business is in an industry that accepts the home based question", () => {
      const homeBasedBusinessIndustries = getIndustries().filter((industry) => {
        return industry.industryOnboardingQuestions.canBeHomeBased === true;
      });
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId:
            homeBasedBusinessIndustries[
              Math.floor(Math.random() * homeBasedBusinessIndustries.length)
            ].id,
        }),
      });
      expect(displayHomedBaseBusinessQuestion(business.profileData, business)).toBe(true);
    });

    it("returns false if the business is in an industry that can not be home based", () => {
      const homeBasedBusinessIndustries = getIndustries().filter((industry) => {
        return industry.industryOnboardingQuestions.canBeHomeBased === false;
      });
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId:
            homeBasedBusinessIndustries[
              Math.floor(Math.random() * homeBasedBusinessIndustries.length)
            ].id,
        }),
      });
      expect(displayHomedBaseBusinessQuestion(business.profileData, business)).toBe(false);
    });
  });

  describe("planned renovation question", () => {
    it("returns false if business is home based", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: true,
        }),
      });
      expect(displayPlannedRenovationQuestion(business.profileData, business)).toBe(false);
    });

    it("returns true for non home based nexus businesses", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: NexusBusinessTypeIds,
        }),
      });
      expect(displayPlannedRenovationQuestion(business.profileData, business)).toBe(true);
    });

    it("returns true for non home based starting businesses", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          businessPersona: "STARTING",
        }),
      });
      expect(displayPlannedRenovationQuestion(business.profileData, business)).toBe(true);
    });
  });

  describe("elevator question", () => {
    it("returns false if business is not provided", () => {
      expect(displayElevatorQuestion(generateProfileData({}))).toBe(false);
    });

    it("returns true for non home based starting businesses", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          businessPersona: "STARTING",
        }),
      });
      expect(displayElevatorQuestion(business.profileData, business)).toBe(true);
    });
  });
});

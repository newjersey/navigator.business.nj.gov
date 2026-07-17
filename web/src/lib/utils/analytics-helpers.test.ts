import analytics from "@/lib/utils/analytics";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import {
  generateProfileData,
  generateUserData,
  getIndustries,
} from "@businessnjgovnavigator/shared/";
import {
  reportUserDataSync,
  sendOnboardingOnSubmitEvents,
  setOnLoadDimensions,
} from "./analytics-helpers";

jest.mock("@/lib/utils/analytics");

const mockAnalytic = analytics as jest.Mocked<typeof analytics>;

const liquorLicenseApplicableIndustries = getIndustries().filter((industry) => {
  return industry.industryOnboardingQuestions.isLiquorLicenseApplicable === true;
});

describe("analytics-helpers", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("reportUserDataSync", () => {
    it("reports a narrowed numeric status without user data", () => {
      reportUserDataSync({
        operation: "save",
        outcome: "error",
        error: { status: 502, data: { sensitive: "not reported" } },
      });

      expect(mockAnalytic.eventRunner.track).toHaveBeenCalledWith({
        event: "user_data_sync",
        operation: "save",
        outcome: "error",
        status: "502",
      });
    });

    it("omits status for an unrecognized error shape", () => {
      reportUserDataSync({
        operation: "fetch",
        outcome: "discarded",
        error: new Error("discarded"),
      });

      expect(mockAnalytic.eventRunner.track).toHaveBeenCalledWith({
        event: "user_data_sync",
        operation: "fetch",
        outcome: "discarded",
        status: undefined,
      });
    });
  });

  describe("setOnLoadDimensions", () => {
    it("sets all analytics dimensions on load", () => {
      const mockUpdate = jest.fn();
      const mockDimensionQueue = {
        update: mockUpdate,
      };

      mockAnalytic.dimensions.currentBusinessId = jest.fn();
      mockAnalytic.dimensions.industry = jest.fn();
      mockAnalytic.dimensions.municipality = jest.fn();
      mockAnalytic.dimensions.legalStructure = jest.fn();
      mockAnalytic.dimensions.homeBasedBusiness = jest.fn();
      mockAnalytic.dimensions.persona = jest.fn();
      mockAnalytic.dimensions.naicsCode = jest.fn();
      mockAnalytic.dimensions.subPersona = jest.fn();
      mockAnalytic.dimensions.phase = jest.fn().mockReturnValue(mockDimensionQueue);
      mockAnalytic.dimensions.userId = jest.fn().mockReturnValue(mockDimensionQueue);
      mockAnalytic.dimensions.abExperience = jest.fn().mockReturnValue(mockDimensionQueue);
      mockAnalytic.dimensions.update = jest.fn();

      const userData = generateUserData({});
      const currentBusiness = userData.businesses[userData.currentBusinessId];

      setOnLoadDimensions(userData);

      expect(mockAnalytic.dimensions.currentBusinessId).toHaveBeenCalledWith(
        userData.currentBusinessId,
      );
      expect(mockAnalytic.dimensions.industry).toHaveBeenCalledWith(
        currentBusiness.profileData.industryId,
      );
      expect(mockAnalytic.dimensions.municipality).toHaveBeenCalledWith(
        currentBusiness.profileData.municipality?.displayName,
      );
      expect(mockAnalytic.dimensions.legalStructure).toHaveBeenCalledWith(
        currentBusiness.profileData.legalStructureId,
      );
      expect(mockAnalytic.dimensions.homeBasedBusiness).toHaveBeenCalledWith(
        currentBusiness.profileData.homeBasedBusiness,
      );
      expect(mockAnalytic.dimensions.naicsCode).toHaveBeenCalledWith(
        currentBusiness.profileData.naicsCode,
      );
      expect(mockAnalytic.dimensions.userId).toHaveBeenCalledWith(userData.user.id);
      expect(mockAnalytic.dimensions.abExperience).toHaveBeenCalledWith(userData.user.abExperience);
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe("sendOnboardingOnSubmitEvents", () => {
    describe("liquor license", () => {
      it("fires yes_require_liquor_license events", () => {
        const userData = generateProfileData({
          industryId: randomElementFromArray(liquorLicenseApplicableIndustries).id,
          liquorLicense: true,
        });
        sendOnboardingOnSubmitEvents(userData, "industry-page");
        expect(mockAnalytic.eventRunner.track).toHaveBeenCalledTimes(1);
        expect(mockAnalytic.eventRunner.track).toHaveBeenCalledWith({
          event: "form_submits",
          form_name: "industry_essential_questions",
          questions: {
            require_liquor_license: "yes",
          },
        });
      });

      it("fires no_dont_require_liquor_license event", () => {
        const userData = generateProfileData({
          industryId: randomElementFromArray(liquorLicenseApplicableIndustries).id,
          liquorLicense: false,
        });
        sendOnboardingOnSubmitEvents(userData, "industry-page");
        expect(mockAnalytic.eventRunner.track).toHaveBeenCalledTimes(1);
        expect(mockAnalytic.eventRunner.track).toHaveBeenCalledWith({
          event: "form_submits",
          form_name: "industry_essential_questions",
          questions: {
            require_liquor_license: "no",
          },
        });
      });

      it("does not fire analytics when page is not the industry-page", () => {
        const userData = generateProfileData({
          industryId: randomElementFromArray(liquorLicenseApplicableIndustries).id,
          liquorLicense: false,
        });
        sendOnboardingOnSubmitEvents(userData);
        expect(mockAnalytic.eventRunner.track).toHaveBeenCalledTimes(0);
      });
    });
  });
});

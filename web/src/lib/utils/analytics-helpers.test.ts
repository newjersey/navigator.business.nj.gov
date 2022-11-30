import { generateProfileData } from "@/test/factories";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { Industries } from "@businessnjgovnavigator/shared/";
import analytics from "./analytics";
import { sendOnboardingOnSubmitEvents } from "./analytics-helpers";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      onboarding_liquor_question: {
        submit: { yes_require_liquor_license: jest.fn(), no_dont_require_liquor_license: jest.fn() },
      },
    },
  };
}

jest.mock("@/lib/utils/analytics", () => {
  return setupMockAnalytics();
});

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

const liquorLicenseApplicableIndustries = Industries.filter((industry) => {
  return industry.industryOnboardingQuestions.isLiquorLicenseApplicable === true;
});

describe("analytics-helpers", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("sendOnboardingOnSubmitEvents", () => {
    describe("liquor license", () => {
      it("fires yes_require_liquor_license events", () => {
        const userData = generateProfileData({
          industryId: randomElementFromArray(liquorLicenseApplicableIndustries).id,
          liquorLicense: true,
        });
        sendOnboardingOnSubmitEvents(userData, "industry-page");
        expect(
          mockAnalytics.event.onboarding_liquor_question.submit.yes_require_liquor_license
        ).toHaveBeenCalledTimes(1);
      });

      it("fires no_dont_require_liquor_license event", () => {
        const userData = generateProfileData({
          industryId: randomElementFromArray(liquorLicenseApplicableIndustries).id,
          liquorLicense: false,
        });
        sendOnboardingOnSubmitEvents(userData, "industry-page");
        expect(
          mockAnalytics.event.onboarding_liquor_question.submit.no_dont_require_liquor_license
        ).toHaveBeenCalledTimes(1);
      });

      it("does not fire analytics when page is not the industry-page", () => {
        const userData = generateProfileData({
          industryId: randomElementFromArray(liquorLicenseApplicableIndustries).id,
          liquorLicense: false,
        });
        sendOnboardingOnSubmitEvents(userData);
        expect(
          mockAnalytics.event.onboarding_liquor_question.submit.no_dont_require_liquor_license
        ).not.toHaveBeenCalled();
        expect(
          mockAnalytics.event.onboarding_liquor_question.submit.yes_require_liquor_license
        ).not.toHaveBeenCalled();
      });
    });
  });
});

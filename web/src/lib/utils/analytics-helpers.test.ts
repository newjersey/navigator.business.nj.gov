import analytics from "@/lib/utils/analytics";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { generateProfileData, getIndustries } from "@businessnjgovnavigator/shared/";
import { sendOnboardingOnSubmitEvents } from "./analytics-helpers";

vi.mock("@/lib/utils/analytics");

const mockAnalytic = analytics as vi.Mocked<typeof analytics>;

const liquorLicenseApplicableIndustries = getIndustries().filter((industry) => {
  return industry.industryOnboardingQuestions.isLiquorLicenseApplicable === true;
});

describe("analytics-helpers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

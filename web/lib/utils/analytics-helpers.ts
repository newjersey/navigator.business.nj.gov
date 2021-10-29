import analytics from "@/lib/utils/analytics";
import { OnboardingData } from "@/lib/types/types";

export const setAnalyticsDimensions = (onboardingData: OnboardingData): void => {
  analytics.dimensions.industry(onboardingData.industryId);
  analytics.dimensions.municipality(onboardingData.municipality?.displayName);
  analytics.dimensions.legalStructure(onboardingData.legalStructureId);
  analytics.dimensions.liquorLicense(onboardingData.liquorLicense ? "true" : "false");
  analytics.dimensions.homeBasedBusiness(onboardingData.homeBasedBusiness ? "true" : "false");
};

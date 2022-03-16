import analytics from "@/lib/utils/analytics";
import { ProfileData } from "@businessnjgovnavigator/shared/";

type RegistrationProgress = "Not Started" | "Began Onboarding" | "Onboarded Guest" | "Fully Registered";

export const setRegistrationDimension = (status: RegistrationProgress) => {
  analytics.dimensions.registrationStatus(status);
};

export const setAnalyticsDimensions = (profileData: ProfileData): void => {
  analytics.dimensions.industry(profileData.industryId);
  analytics.dimensions.municipality(profileData.municipality?.displayName);
  analytics.dimensions.legalStructure(profileData.legalStructureId);
  analytics.dimensions.liquorLicense(profileData.liquorLicense ? "true" : "false");
  analytics.dimensions.homeBasedBusiness(profileData.homeBasedBusiness ? "true" : "false");
  analytics.dimensions.persona(profileData.hasExistingBusiness ? "Existing" : "Prospective");
};

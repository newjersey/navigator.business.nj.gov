import { isCannabisLicenseApplicable } from "@/lib/domain-logic/isCannabisLicenseApplicable";
import { isCpaRequiredApplicable } from "@/lib/domain-logic/isCpaRequiredApplicable";
import analytics from "@/lib/utils/analytics";
import { ABExperience, ProfileData } from "@businessnjgovnavigator/shared/";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";

type RegistrationProgress = "Not Started" | "Began Onboarding" | "Onboarded Guest" | "Fully Registered";

export const setRegistrationDimension = (status: RegistrationProgress) => {
  analytics.dimensions.registrationStatus(status);
};

export const setABExperienceDimension = (value: ABExperience) => {
  analytics.dimensions.abExperience(value);
};

export const setAnalyticsDimensions = (profileData: ProfileData): void => {
  analytics.dimensions.industry(profileData.industryId);
  analytics.dimensions.municipality(profileData.municipality?.displayName);
  analytics.dimensions.legalStructure(profileData.legalStructureId);
  analytics.dimensions.liquorLicense(profileData.liquorLicense ? "true" : "false");
  analytics.dimensions.homeBasedBusiness(profileData.homeBasedBusiness ? "true" : "false");
  analytics.dimensions.persona(getPersonaDimension(profileData.businessPersona));
  analytics.dimensions.naicsCode(profileData.naicsCode);
};

const getPersonaDimension = (persona: BusinessPersona): string => {
  switch (persona) {
    case "STARTING":
      return "Prospective";
    case "OWNING":
      return "Existing";
    case "FOREIGN":
      return "Foreign Prospective";
    default:
      return "";
  }
};

export const sendOnboardingOnSubmitEvents = (newProfileData: ProfileData, pageName?: string): void => {
  if (pageName === "industry-page-starting") {
    if (isCannabisLicenseApplicable(newProfileData.industryId)) {
      if (newProfileData.cannabisLicenseType === "CONDITIONAL") {
        analytics.event.onboarding_cannabis_question.submit.conditional_cannabis_license();
      } else if (newProfileData.cannabisLicenseType === "ANNUAL") {
        analytics.event.onboarding_cannabis_question.submit.annual_cannabis_license();
      }
    }

    if (isCpaRequiredApplicable(newProfileData.industryId)) {
      if (newProfileData.requiresCpa) {
        analytics.event.onboarding_cpa_question.submit.yes_i_offer_public_accounting();
      } else {
        analytics.event.onboarding_cpa_question.submit.no_i_dont_offer_public_accounting();
      }
    }
  }
};

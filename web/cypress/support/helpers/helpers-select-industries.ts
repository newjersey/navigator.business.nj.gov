import { randomElementFromArray } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { Industries, Industry } from "@businessnjgovnavigator/shared/lib/shared/src/industry";

export const homeBasedIndustries = Industries.filter((industry) => {
  return industry.industryOnboardingQuestions.canBeHomeBased && industry.canHavePermanentLocation;
});
export const liquorLicenseIndustries = Industries.filter((industry) => {
  return industry.industryOnboardingQuestions.isLiquorLicenseApplicable;
});
export const industriesNotHomeBasedOrLiquorLicense = Industries.filter((industry) => {
  return (
    !industry.industryOnboardingQuestions.canBeHomeBased &&
    industry.canHavePermanentLocation &&
    !industry.industryOnboardingQuestions.isLiquorLicenseApplicable
  );
});
export const randomHomeBasedIndustry = (): Industry => {
  return randomElementFromArray(homeBasedIndustries.filter((x) => x.isEnabled) as Industry[]);
};
export const randomNonHomeBasedIndustry = (): Industry => {
  return randomElementFromArray(
    industriesNotHomeBasedOrLiquorLicense.filter((x) => x.isEnabled) as Industry[]
  );
};

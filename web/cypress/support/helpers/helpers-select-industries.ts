import { randomElementFromArray } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { getIndustries, Industry } from "@businessnjgovnavigator/shared/lib/shared/src/industry";

export const homeBasedIndustries = getIndustries().filter((industry) => {
  return industry.industryOnboardingQuestions.canBeHomeBased && industry.canHavePermanentLocation;
});
export const liquorLicenseIndustries = getIndustries().filter((industry) => {
  return industry.industryOnboardingQuestions.isLiquorLicenseApplicable;
});
export const industriesNotHomeBasedOrLiquorLicense = getIndustries().filter((industry) => {
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

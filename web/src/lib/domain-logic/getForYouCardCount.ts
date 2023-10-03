import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { getVisibleCertifications } from "@/lib/domain-logic/getVisibleCertifications";
import { getVisibleFundings } from "@/lib/domain-logic/getVisibleFundings";
import { Certification, Funding } from "@/lib/types/types";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/operatingPhase";
import { Business } from "@businessnjgovnavigator/shared/userData";

export const getForYouCardCount = (
  business: Business | undefined,
  certifications: Certification[],
  fundings: Funding[]
): number => {
  let count = 0;

  if (business === undefined) {
    return count;
  }

  if (LookupOperatingPhaseById(business?.profileData.operatingPhase).displayCertifications) {
    count += getVisibleCertifications(filterCertifications(certifications, business), business).length;
  }

  if (LookupOperatingPhaseById(business?.profileData.operatingPhase).displayFundings) {
    count += getVisibleFundings(filterFundings(fundings, business), business).length;
  }

  if (business?.preferences.visibleSidebarCards.length) {
    count += business?.preferences.visibleSidebarCards.length;
  }
  return count;
};

import { SMALL_BUSINESS_MAX_EMPLOYEE_COUNT } from "@/lib/domain-logic/smallBusinessEnterprise";
import {
  Certification,
  County,
  defaultMarkdownDateFormat,
  Funding,
  FundingStatusOrder,
  SidebarCardContent,
} from "@/lib/types/types";
import { getCurrentDate, parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/operatingPhase";
import { arrayOfOwnershipTypes } from "@businessnjgovnavigator/shared/ownership";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";

export const getHiddenCertifications = (
  business: Business | undefined,
  certifications: Certification[]
): Certification[] => {
  if (!business) return [];

  return certifications.filter((it) => {
    return business.preferences.hiddenCertificationIds.includes(it.id);
  });
};
export const sortCertifications = (certifications: Certification[]): Certification[] => {
  return certifications.sort((a, b) => {
    const nameA = a.name.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
};
export const getVisibleCertifications = (
  certifications: Certification[],
  business: Business | undefined
): Certification[] => {
  if (!business) return [];

  return certifications.filter((it) => {
    return !business?.preferences.hiddenCertificationIds.includes(it.id);
  });
};
export const sortFundings = (fundings: Funding[], userData?: UserData): Funding[] => {
  const initialSorting = fundings.sort((a, b) => {
    const nameA = a.name.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.toUpperCase();
    if (FundingStatusOrder[a.status] < FundingStatusOrder[b.status]) {
      return -1;
    } else if (FundingStatusOrder[a.status] > FundingStatusOrder[b.status]) {
      return 1;
    } else if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  if (userData?.user.accountCreationSource) {
    const agencySource = mapAccountCreationSourceToAgencySource(userData.user.accountCreationSource);
    return prioritizeFundingByAgencySource(initialSorting, agencySource);
  }
  return initialSorting;
};

const mapAccountCreationSourceToAgencySource = (accountCreationSource: string): string => {
  switch (accountCreationSource) {
    case "investNewark":
      return "invest-newark";
    default:
      return "";
  }
};

const prioritizeFundingByAgencySource = (fundings: Funding[], agencyName: string): Funding[] => {
  if (agencyName === "") {
    return fundings;
  }
  const agencyFundings: Funding[] = [];
  const nonAgencyFundings: Funding[] = [];

  for (const funding of fundings) {
    if (funding.agency?.includes(agencyName)) {
      agencyFundings.push(funding);
    } else nonAgencyFundings.push(funding);
  }
  agencyFundings.push(...nonAgencyFundings);
  return agencyFundings;
};
export const getVisibleSideBarCards = (
  business: Business | undefined,
  sidebarDisplayContent: Record<string, SidebarCardContent> | undefined
): SidebarCardContent[] => {
  if (!business || !sidebarDisplayContent) return [];

  return business.preferences.visibleSidebarCards.map((id: string) => {
    return sidebarDisplayContent[id];
  });
};
export const getVisibleFundings = (fundings: Funding[], business: Business | undefined): Funding[] => {
  if (!business) return [];
  return fundings.filter((it) => {
    return !business?.preferences.hiddenFundingIds.includes(it.id);
  });
};
export const getHiddenFundings = (business: Business | undefined, fundings: Funding[]): Funding[] => {
  if (!business) return [];
  return fundings.filter((it: Funding) => {
    return business.preferences.hiddenFundingIds.includes(it.id);
  });
};
export const filterFundings = ({
  fundings,
  business,
}: {
  fundings?: Funding[];
  business?: Business;
}): Funding[] => {
  if (!fundings || !business) {
    return [];
  }

  return fundings.filter((it) => {
    if (it.publishStageArchive === "Do Not Publish") {
      return false;
    }

    if (it.dueDate) {
      return !parseDateWithFormat(it.dueDate, defaultMarkdownDateFormat).isBefore(getCurrentDate());
    }

    if (business.profileData.homeBasedBusiness && it.homeBased !== "yes" && it.homeBased !== "unknown") {
      return false;
    }

    if (
      it.isNonprofitOnly &&
      business.profileData.legalStructureId &&
      business.profileData.legalStructureId !== "nonprofit"
    ) {
      return false;
    }

    if (
      business.profileData.municipality &&
      it.county.length > 0 &&
      !it.county.includes("All") &&
      !it.county.includes(business.profileData.municipality.county as County)
    ) {
      return false;
    }

    if (it.sector && business.profileData.sectorId && it.sector.length > 0) {
      const sectorRegex = new RegExp(it.sector.join("|"), "i");
      if (!sectorRegex.test(business.profileData.sectorId)) {
        return false;
      }
    }

    if (
      business.profileData.existingEmployees &&
      it.employeesRequired &&
      Number.parseInt(business.profileData.existingEmployees) === 0 &&
      it.employeesRequired !== "n/a"
    ) {
      return false;
    }

    if (it.status === "closed" || it.status === "opening soon") {
      return false;
    }

    if (it.certifications) {
      if (it.certifications.length > 0 && business.profileData.ownershipTypeIds.length > 0) {
        const ownershipTypeIds = new Set(arrayOfOwnershipTypes.map((ownershipType) => ownershipType.id));
        const ownershipTypeCerts = it.certifications.filter((cert) => ownershipTypeIds.has(cert));

        if (ownershipTypeCerts.length > 0) {
          const ownershipType = it.certifications.some((ownershipType) => {
            return business.profileData.ownershipTypeIds.includes(ownershipType);
          });
          if (!ownershipType) {
            return false;
          }
        }
      }

      if (it.certifications.includes("small-business-enterprise")) {
        const employeeCount = Number(business.profileData.existingEmployees as string);
        if (employeeCount >= SMALL_BUSINESS_MAX_EMPLOYEE_COUNT) {
          return false;
        }
      }
    }

    return true;
  });
};
export const filterCertifications = ({
  certifications,
  business,
}: {
  certifications?: Certification[];
  business?: Business;
}): Certification[] => {
  if (!certifications || !business) {
    return [];
  }

  return certifications.filter((it) => {
    let allowedCertification = true;

    if (
      !!it.applicableOwnershipTypes &&
      it.applicableOwnershipTypes.length > 0 &&
      business.profileData.ownershipTypeIds.length > 0
    ) {
      const ownershipType = it.applicableOwnershipTypes.some((cert) => {
        return business.profileData.ownershipTypeIds.includes(cert);
      });
      if (!ownershipType) {
        allowedCertification = false;
      }
    }

    if (it.isSbe) {
      const employeeCount = Number(business.profileData.existingEmployees as string);
      if (employeeCount >= SMALL_BUSINESS_MAX_EMPLOYEE_COUNT) {
        allowedCertification = false;
      }
    }

    return allowedCertification;
  });
};
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
    count += getVisibleCertifications(filterCertifications({ certifications, business }), business).length;
  }

  if (LookupOperatingPhaseById(business?.profileData.operatingPhase).displayFundings) {
    count += getVisibleFundings(filterFundings({ fundings, business }), business).length;
  }

  if (business?.preferences.visibleSidebarCards.length) {
    count += business?.preferences.visibleSidebarCards.length;
  }
  return count;
};

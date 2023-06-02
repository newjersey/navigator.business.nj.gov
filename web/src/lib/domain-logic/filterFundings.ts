import { SMALL_BUSINESS_MAX_EMPLOYEE_COUNT } from "@/lib/domain-logic/smallBusinessEnterprise";
import { County, defaultMarkdownDateFormat, Funding } from "@/lib/types/types";
import { Business, getCurrentDate, parseDateWithFormat } from "@businessnjgovnavigator/shared";
import { arrayOfOwnershipTypes } from "@businessnjgovnavigator/shared/";

export const filterFundings = (fundings: Funding[], business: Business): Funding[] => {
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

    if (
      it.certifications !== null &&
      it.certifications.length > 0 &&
      business.profileData.ownershipTypeIds.length > 0
    ) {
      const ownershipTypeIds = new Set(arrayOfOwnershipTypes.map((ownershipType) => ownershipType.id)); // ['woman-owned', 'veteran-owned...]
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

    if (it.certifications !== null && it.certifications.includes("small-business-enterprise")) {
      const employeeCount = Number(business.profileData.existingEmployees as string);
      if (employeeCount >= SMALL_BUSINESS_MAX_EMPLOYEE_COUNT) {
        return false;
      }
    }

    return true;
  });
};

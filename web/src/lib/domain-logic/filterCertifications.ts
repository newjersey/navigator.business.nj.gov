import { SMALL_BUSINESS_MAX_EMPLOYEE_COUNT } from "@/lib/domain-logic/smallBusinessEnterprise";
import { Certification } from "@/lib/types/types";
import { Business } from "@businessnjgovnavigator/shared";

export const filterCertifications = (
  certifications: Certification[],
  business: Business
): Certification[] => {
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

import { SMALL_BUSINESS_MAX_EMPLOYEE_COUNT } from "@/lib/domain-logic/smallBusinessEnterprise";
import { Certification } from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared/";

export const filterCertifications = (
  certifications: Certification[],
  userData: UserData
): Certification[] => {
  return certifications.filter((it) => {
    let allowedCertification = true;

    if (
      it.applicableOwnershipTypes !== null &&
      it.applicableOwnershipTypes.length > 0 &&
      userData.profileData.ownershipTypeIds.length > 0
    ) {
      const ownershipType = it.applicableOwnershipTypes.some((cert) => {
        return userData.profileData.ownershipTypeIds.includes(cert);
      });
      if (!ownershipType) {
        allowedCertification = false;
      }
    }

    if (it.isSbe) {
      const employeeCount = Number(userData.profileData.existingEmployees as string);
      if (employeeCount >= SMALL_BUSINESS_MAX_EMPLOYEE_COUNT) {
        allowedCertification = false;
      }
    }

    return allowedCertification;
  });
};

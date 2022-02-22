import { Certification } from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared";

export const LARGE_BUSINESS_MIN_EMPLOYEE_COUNT = 120;

export const filterCertifications = (
  certifications: Certification[],
  userData: UserData
): Certification[] => {
  return certifications.filter((it) => {
    let allowedCertification = true;

    if (it.applicableOwnershipTypes.length > 0) {
      const ownerShipType = it.applicableOwnershipTypes.some((cert) => {
        return userData.profileData.ownershipTypeIds.includes(cert);
      });
      if (!ownerShipType) allowedCertification = false;
    }

    if (it.isSbe) {
      const employeeCount = Number(userData.profileData.existingEmployees as string);
      if (employeeCount >= LARGE_BUSINESS_MIN_EMPLOYEE_COUNT) {
        allowedCertification = false;
      }
    }

    return allowedCertification;
  });
};

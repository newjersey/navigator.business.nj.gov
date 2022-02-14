import { Certification } from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared";

export const filterCertifications = (
  certifications: Certification[],
  userData: UserData
): Certification[] => {
  return certifications.filter((it) => {
    if (it.applicableOwnershipTypes.length === 0) return true;
    return it.applicableOwnershipTypes.some((cert) => {
      return userData.profileData.ownershipTypeIds.some((ownershipType) => {
        console.log(cert, ownershipType);
        return cert === ownershipType;
      });
    });
  });
};

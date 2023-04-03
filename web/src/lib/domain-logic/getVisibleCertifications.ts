import { UserData } from "@businessnjgovnavigator/shared/userData";
import { Certification } from "../types/types";

export const getVisibleCertifications = (
  certifications: Certification[],
  userData: UserData
): Certification[] => {
  return certifications.filter((it) => {
    return !userData?.preferences.hiddenCertificationIds.includes(it.id);
  });
};

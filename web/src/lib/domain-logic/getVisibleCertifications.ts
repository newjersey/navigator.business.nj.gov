import { Business } from "@businessnjgovnavigator/shared/userData";
import { Certification } from "../types/types";

export const getVisibleCertifications = (
  certifications: Certification[],
  business: Business
): Certification[] => {
  return certifications.filter((it) => {
    return !business?.preferences.hiddenCertificationIds.includes(it.id);
  });
};

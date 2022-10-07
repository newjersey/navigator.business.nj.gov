import { UserData } from "@businessnjgovnavigator/shared/userData";
import { Certification } from "../types/types";

export const getVisibleCertifications = (certifications: Certification[], userData: UserData) => {
  return certifications.filter((it) => !userData?.preferences.hiddenCertificationIds.includes(it.id));
};

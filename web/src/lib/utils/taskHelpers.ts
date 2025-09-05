import { Business } from "@businessnjgovnavigator/shared/userData";

export const shouldLockBusinessAddress = (business?: Business): boolean => {
  if (!business) return false;

  if (!business.formationData.completedFilingPayment) return false;

  const addressLine1 = business.formationData.formationFormData.addressLine1;
  const addressCity =
    business.formationData?.formationFormData?.addressMunicipality ||
    business.formationData.formationFormData.addressCity;
  const addressZipCode = business.formationData.formationFormData.addressZipCode;

  if (!addressLine1 || !addressCity || !addressZipCode) return false;

  return true;
};

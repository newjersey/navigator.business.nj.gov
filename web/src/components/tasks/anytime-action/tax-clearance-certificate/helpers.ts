import { Business } from "@businessnjgovnavigator/shared/userData";

export const getInitialTaxId = (business: Business | undefined): string => {
  return business?.taxClearanceCertificateData?.taxId || business?.profileData.taxId || "";
};

export const getInitialTaxPin = (business: Business | undefined): string => {
  return business?.taxClearanceCertificateData?.taxPin || business?.profileData.taxPin || "";
};

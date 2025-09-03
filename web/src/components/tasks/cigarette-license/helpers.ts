import { LookupMunicipalityByName } from "@businessnjgovnavigator/shared/municipality";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";

export const getInitialTaxId = (business: Business | undefined): string => {
  return business?.cigaretteLicenseData?.taxId || business?.profileData.taxId || "";
};

export const getInitialData = (
  userData: UserData,
  business: Business,
): {
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  taxId: string;
  encryptedTaxId: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: StateObject | undefined;
  addressZipCode: string;
  mailingAddressIsTheSame: boolean;
  mailingAddressLine1: string;
  mailingAddressLine2: string;
  mailingAddressCity: string;
  mailingAddressState: StateObject | undefined;
  mailingAddressZipCode: string;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  salesInfoStartDate: string;
  salesInfoSupplier: string[];
  signerName: string;
  signerRelationship: string;
  signature: boolean;
  lastUpdatedISO?: string;
} => {
  const businessName =
    business.cigaretteLicenseData?.businessName || business.profileData.businessName || "";
  const responsibleOwnerName =
    business.cigaretteLicenseData?.responsibleOwnerName ||
    business.profileData.responsibleOwnerName ||
    "";
  const tradeName =
    business.cigaretteLicenseData?.tradeName || business.profileData.tradeName || "";
  const taxId = getInitialTaxId(business);
  const encryptedTaxId =
    business.cigaretteLicenseData?.encryptedTaxId || business.profileData.encryptedTaxId || "";
  const addressLine1 =
    business.cigaretteLicenseData?.addressLine1 ||
    business.formationData.formationFormData.addressLine1 ||
    "";
  const addressLine2 =
    business.cigaretteLicenseData?.addressLine2 ||
    business.formationData.formationFormData.addressLine2 ||
    "";
  const addressCity =
    business.cigaretteLicenseData?.addressCity ||
    LookupMunicipalityByName(business.formationData?.formationFormData?.addressMunicipality?.name)
      ?.displayName ||
    business.formationData.formationFormData.addressCity ||
    "";
  const addressState = { name: "New Jersey", shortCode: "NJ" } as StateObject;
  const addressZipCode =
    business.cigaretteLicenseData?.addressZipCode ||
    business.formationData.formationFormData.addressZipCode ||
    "";
  const mailingAddressIsTheSame = business.cigaretteLicenseData?.mailingAddressIsTheSame || false;
  const mailingAddressLine1 = business.cigaretteLicenseData?.mailingAddressLine1 || "";
  const mailingAddressLine2 = business.cigaretteLicenseData?.mailingAddressLine2 || "";
  const mailingAddressCity = business.cigaretteLicenseData?.mailingAddressCity || "";
  const mailingAddressState = business.cigaretteLicenseData?.mailingAddressState || undefined;
  const mailingAddressZipCode = business.cigaretteLicenseData?.mailingAddressZipCode || "";
  const contactName = business.cigaretteLicenseData?.contactName || userData.user.name || "";
  const contactEmail = business.cigaretteLicenseData?.contactEmail || userData.user.email || "";
  const contactPhoneNumber = business.cigaretteLicenseData?.contactPhoneNumber || "";
  const salesInfoStartDate = business.cigaretteLicenseData?.salesInfoStartDate || "";
  const salesInfoSupplier = business.cigaretteLicenseData?.salesInfoSupplier || [];
  const signerName = business.cigaretteLicenseData?.signerName || "";
  const signerRelationship = business.cigaretteLicenseData?.signerRelationship || "";
  const signature = business.cigaretteLicenseData?.signature || false;

  return {
    businessName,
    responsibleOwnerName,
    tradeName,
    taxId,
    encryptedTaxId,
    addressLine1,
    addressLine2,
    addressCity,
    addressState,
    addressZipCode,
    mailingAddressIsTheSame,
    mailingAddressLine1,
    mailingAddressLine2,
    mailingAddressCity,
    mailingAddressState,
    mailingAddressZipCode,
    contactName,
    contactPhoneNumber,
    contactEmail,
    salesInfoStartDate,
    salesInfoSupplier,
    signerName,
    signerRelationship,
    signature,
    lastUpdatedISO: business.cigaretteLicenseData?.lastUpdatedISO,
  };
};

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

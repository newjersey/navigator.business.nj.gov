import { isTradeNameLegalStructureApplicable } from "@/lib/domain-logic/isTradeNameLegalStructureApplicable";
import { CigaretteLicenseData } from "@businessnjgovnavigator/shared/cigaretteLicense";
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

export const isAnyRequiredFieldEmpty = (
  data: CigaretteLicenseData,
  stepIndex: number,
  legalStructureId?: string,
): boolean => {
  switch (stepIndex) {
    case 1: {
      const businessNameFields = isTradeNameLegalStructureApplicable(legalStructureId)
        ? {
            responsibleOwnerName: data.responsibleOwnerName === "",
            tradeName: data.tradeName === "",
          }
        : {
            businessName: data.businessName === "",
          };

      const mailingAddressFields = data.mailingAddressIsTheSame
        ? {}
        : {
            mailingAddressLine1: data.mailingAddressLine1 === "",
            mailingAddressCity: data.mailingAddressCity === "",
            mailingAddressState: data.mailingAddressState === undefined,
            mailingAddressZipCode: data.mailingAddressZipCode === "",
          };

      const step1Fields = {
        ...businessNameFields,
        taxId: data.taxId === "",
        addressLine1: data.addressLine1 === "",
        addressCity: data.addressCity === "",
        addressState: data.addressState === undefined,
        addressZipCode: data.addressZipCode === "",
        contactName: data.contactName === "",
        contactPhoneNumber: data.contactPhoneNumber === "",
        contactEmail: data.contactEmail === "",
        ...mailingAddressFields,
      };

      return Object.values(step1Fields).some(Boolean);
    }

    case 2: {
      const step2Fields = {
        salesInfoStartDate: data.salesInfoStartDate === "",
        salesInfoSupplier: data.salesInfoSupplier === undefined,
      };

      return Object.values(step2Fields).some(Boolean);
    }

    case 3: {
      const step3Fields = {
        signature: data.signature === false,
        signerRelationship: data.signerRelationship === "",
        signerName: data.signerName === "",
      };

      return Object.values(step3Fields).some(Boolean);
    }

    default:
      return false;
  }
};

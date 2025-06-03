import { LookupMunicipalityByName } from "@businessnjgovnavigator/shared/municipality";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import {
  TaxClearanceCertificateData,
  TaxClearanceEligibilityOption,
} from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import { Business } from "@businessnjgovnavigator/shared/userData";

export const getInitialTaxId = (business: Business | undefined): string => {
  return business?.taxClearanceCertificateData?.taxId || business?.profileData.taxId || "";
};

export const getInitialTaxPin = (business: Business | undefined): string => {
  return business?.taxClearanceCertificateData?.taxPin || business?.profileData.taxPin || "";
};

export const getInitialData = (
  business: Business,
): {
  requestingAgencyId: string;
  businessName: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: StateObject | undefined;
  addressZipCode: string;
  taxId: string;
  encryptedTaxId: string | undefined;
  taxPin: string;
  encryptedTaxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean;
  lastUpdatedISO: string | undefined;
  checkEligibilityOption: TaxClearanceEligibilityOption;
  dateOfFormation: string;
  legalStructureId: string;
} => {
  const requestingAgencyId = business.taxClearanceCertificateData?.requestingAgencyId || "";
  const businessName =
    business.taxClearanceCertificateData?.businessName || business.profileData.businessName || "";
  const addressLine1 =
    business.taxClearanceCertificateData?.addressLine1 ||
    business.formationData.formationFormData.addressLine1 ||
    "";
  const addressLine2 =
    business.taxClearanceCertificateData?.addressLine2 ||
    business.formationData.formationFormData.addressLine2 ||
    "";
  const addressCity =
    business.taxClearanceCertificateData?.addressCity ||
    LookupMunicipalityByName(business.formationData.formationFormData.addressMunicipality?.name)
      .displayName ||
    business.formationData.formationFormData.addressCity ||
    "";
  const addressState =
    business.taxClearanceCertificateData?.addressState ||
    business.formationData.formationFormData.addressState ||
    undefined;
  const addressZipCode =
    business.taxClearanceCertificateData?.addressZipCode ||
    business.formationData.formationFormData.addressZipCode ||
    "";
  const taxId = getInitialTaxId(business);
  const encryptedTaxId =
    business.taxClearanceCertificateData?.encryptedTaxId ||
    business.profileData.encryptedTaxId ||
    undefined;
  const taxPin = getInitialTaxPin(business);
  const encryptedTaxPin =
    business.taxClearanceCertificateData?.encryptedTaxPin ||
    business.profileData.encryptedTaxPin ||
    undefined;
  const checkEligibilityOption =
    business.taxClearanceCertificateData?.checkEligibilityOption || "TAX_ID";
  const dateOfFormation =
    business.taxClearanceCertificateData?.dateOfFormation ||
    business.profileData.dateOfFormation ||
    "";
  const legalStructureId =
    business.taxClearanceCertificateData?.legalStructureId ||
    business.profileData.legalStructureId ||
    "";

  return {
    requestingAgencyId,
    businessName,
    addressLine1,
    addressLine2,
    addressCity,
    addressState,
    addressZipCode,
    taxId,
    encryptedTaxId,
    taxPin,
    encryptedTaxPin,
    hasPreviouslyReceivedCertificate:
      business.taxClearanceCertificateData?.hasPreviouslyReceivedCertificate ?? false,
    lastUpdatedISO: business.taxClearanceCertificateData?.lastUpdatedISO,
    checkEligibilityOption,
    dateOfFormation,
    legalStructureId,
  };
};

export const isAnyRequiredFieldEmpty = (
  taxClearanceCertificateData: TaxClearanceCertificateData,
): boolean => {
  const anyEmptySharedFields =
    (taxClearanceCertificateData.requestingAgencyId ?? "").trim() === "" ||
    (taxClearanceCertificateData.businessName ?? "").trim() === "" ||
    (taxClearanceCertificateData.addressLine1 ?? "").trim() === "" ||
    (taxClearanceCertificateData.addressCity ?? "").trim() === "" ||
    taxClearanceCertificateData.addressState === undefined ||
    (taxClearanceCertificateData.addressZipCode ?? "").trim() === "";

  const anyEmptyConditionalFields = (): boolean => {
    if (taxClearanceCertificateData.checkEligibilityOption === "TAX_ID") {
      return (
        (taxClearanceCertificateData.taxId ?? "").trim() === "" ||
        (taxClearanceCertificateData.taxPin ?? "").trim() === ""
      );
    }
    if (taxClearanceCertificateData.checkEligibilityOption === "BUSINESS_TYPE") {
      return (
        (taxClearanceCertificateData.legalStructureId ?? "").trim() === "" ||
        (taxClearanceCertificateData.dateOfFormation ?? "").trim() === ""
      );
    }
    return true;
  };

  return anyEmptySharedFields || anyEmptyConditionalFields();
};

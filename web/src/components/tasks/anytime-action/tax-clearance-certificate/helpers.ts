import { LookupMunicipalityByName } from "@businessnjgovnavigator/shared/municipality";
import { StateObject } from "@businessnjgovnavigator/shared/states";
import { TaxClearanceCertificateData } from "@businessnjgovnavigator/shared/taxClearanceCertificate";
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
} => {
  const requestingAgencyId = business.taxClearanceCertificateData?.requestingAgencyId || "";
  const businessName =
    business?.taxClearanceCertificateData?.businessName || business?.profileData.businessName || "";
  const addressLine1 =
    business?.taxClearanceCertificateData?.addressLine1 ||
    business.formationData.formationFormData.addressLine1 ||
    "";
  const addressLine2 =
    business?.taxClearanceCertificateData?.addressLine2 ||
    business.formationData.formationFormData.addressLine2 ||
    "";
  const addressCity =
    business?.taxClearanceCertificateData?.addressCity ||
    LookupMunicipalityByName(business?.formationData?.formationFormData?.addressMunicipality?.name)
      ?.displayName ||
    business.formationData.formationFormData.addressCity ||
    "";
  const addressState =
    business?.taxClearanceCertificateData?.addressState ||
    business.formationData?.formationFormData?.addressState ||
    undefined;
  const addressZipCode =
    business?.taxClearanceCertificateData?.addressZipCode ||
    business.formationData.formationFormData.addressZipCode ||
    "";
  const taxId = getInitialTaxId(business);
  const encryptedTaxId =
    business?.taxClearanceCertificateData?.encryptedTaxId ||
    business.profileData.encryptedTaxId ||
    undefined;
  const taxPin = getInitialTaxPin(business);
  const encryptedTaxPin =
    business?.taxClearanceCertificateData?.encryptedTaxPin ||
    business.profileData.encryptedTaxPin ||
    undefined;

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
  };
};

export const getAllFieldsNonEmpty = (
  taxClearanceCertificateData: TaxClearanceCertificateData,
): boolean => {
  return (
    (taxClearanceCertificateData.requestingAgencyId ?? "").trim() !== "" &&
    (taxClearanceCertificateData.businessName ?? "").trim() !== "" &&
    (taxClearanceCertificateData.addressLine1 ?? "").trim() !== "" &&
    (taxClearanceCertificateData.addressCity ?? "").trim() !== "" &&
    taxClearanceCertificateData.addressState !== undefined &&
    (taxClearanceCertificateData.addressZipCode ?? "").trim() !== "" &&
    (taxClearanceCertificateData.taxId ?? "").trim() !== "" &&
    (taxClearanceCertificateData.taxPin ?? "").trim() !== ""
  );
};

export const isAnyFieldEmpty = (
  taxClearanceCertificateData: TaxClearanceCertificateData,
): boolean => {
  return (
    (taxClearanceCertificateData.requestingAgencyId ?? "").trim() === "" ||
    (taxClearanceCertificateData.businessName ?? "").trim() === "" ||
    (taxClearanceCertificateData.addressLine1 ?? "").trim() === "" ||
    (taxClearanceCertificateData.addressCity ?? "").trim() === "" ||
    taxClearanceCertificateData.addressState === undefined ||
    (taxClearanceCertificateData.addressZipCode ?? "").trim() === "" ||
    (taxClearanceCertificateData.taxId ?? "").trim() === "" ||
    (taxClearanceCertificateData.taxPin ?? "").trim() === ""
  );
};

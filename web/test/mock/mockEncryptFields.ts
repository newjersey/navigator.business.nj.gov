import {
  getCurrentBusiness,
  maskingCharacter,
  modifyCurrentBusiness,
} from "@businessnjgovnavigator/shared/index";
import { type UserData } from "@businessnjgovnavigator/shared/userData";

export const maskTaxId = (taxId: string): string => {
  return taxId.length === 12
    ? `${maskingCharacter.repeat(7)}${taxId.slice(7, taxId.length)}`
    : `${maskingCharacter.repeat(5)}${taxId.slice(5, taxId.length)}`;
};

export const mockEncryptFields = (userData: UserData): UserData => {
  const currentBusiness = getCurrentBusiness(userData);
  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    profileData: {
      ...business.profileData,
      taxId:
        !currentBusiness.profileData.taxId ||
        currentBusiness.profileData.taxId?.includes(maskingCharacter)
          ? currentBusiness.profileData.taxId
          : maskTaxId(currentBusiness.profileData.taxId as string),
      encryptedTaxId:
        !currentBusiness.profileData.taxId ||
        currentBusiness.profileData.taxId?.includes(maskingCharacter)
          ? currentBusiness.profileData.encryptedTaxId
          : `encrypted-${currentBusiness.profileData.taxId}`,
      taxPin:
        !currentBusiness.profileData.taxPin ||
        currentBusiness.profileData.taxPin?.includes(maskingCharacter)
          ? currentBusiness.profileData.taxPin
          : maskingCharacter.repeat(currentBusiness.profileData.taxPin.length),
      encryptedTaxPin:
        !currentBusiness.profileData.taxPin ||
        currentBusiness.profileData.taxPin?.includes(maskingCharacter)
          ? currentBusiness.profileData.encryptedTaxPin
          : `encrypted-${currentBusiness.profileData.taxPin}`,
    },
    taxClearanceCertificateData: business.taxClearanceCertificateData
      ? {
          ...business.taxClearanceCertificateData,
          taxId:
            !currentBusiness.taxClearanceCertificateData?.taxId ||
            currentBusiness.taxClearanceCertificateData?.taxId?.includes(maskingCharacter)
              ? currentBusiness.taxClearanceCertificateData?.taxId
              : maskTaxId(currentBusiness.taxClearanceCertificateData?.taxId as string),
          encryptedTaxId:
            !currentBusiness.taxClearanceCertificateData?.taxId ||
            currentBusiness.taxClearanceCertificateData?.taxId?.includes(maskingCharacter)
              ? currentBusiness.taxClearanceCertificateData?.encryptedTaxId
              : `encrypted-${currentBusiness.taxClearanceCertificateData?.taxId}`,
          taxPin:
            !currentBusiness.taxClearanceCertificateData?.taxPin ||
            currentBusiness.taxClearanceCertificateData?.taxPin?.includes(maskingCharacter)
              ? currentBusiness.taxClearanceCertificateData?.taxPin
              : maskingCharacter.repeat(currentBusiness.taxClearanceCertificateData?.taxPin.length),
          encryptedTaxPin:
            !currentBusiness.taxClearanceCertificateData?.taxPin ||
            currentBusiness.taxClearanceCertificateData?.taxPin?.includes(maskingCharacter)
              ? currentBusiness.taxClearanceCertificateData?.encryptedTaxPin
              : `encrypted-${currentBusiness.taxClearanceCertificateData?.taxPin}`,
        }
      : undefined,
  }));
};

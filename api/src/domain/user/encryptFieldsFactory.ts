import { EncryptionDecryptionClient } from "@domain/types";
import { maskTaxId } from "@domain/user/maskTaxId";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { maskingCharacter } from "@shared/profileData";
import { UserData } from "@shared/userData";

export const encryptFieldsFactory = (
  encryptionDecryptionClient: EncryptionDecryptionClient,
): ((userData: UserData) => Promise<UserData>) => {
  return async (userData: UserData): Promise<UserData> => {
    const encryptionFunctions = [
      encryptProfileTaxId,
      encryptProfileTaxPin,
      encryptTaxClearanceTaxId,
      encryptTaxClearanceTaxPin,
    ];
    let encryptedUserData = userData;
    for (const encryptionFunction of encryptionFunctions) {
      encryptedUserData = await encryptionFunction(encryptedUserData, encryptionDecryptionClient);
    }
    return encryptedUserData;
  };
};

export const encryptTaxIdForBatchLambdaFactory = (
  encryptionDecryptionClient: EncryptionDecryptionClient,
): ((userData: UserData) => Promise<UserData>) => {
  return async (userData: UserData): Promise<UserData> => {
    const userDataWithEncryptedTaxId = await encryptProfileTaxId(
      userData,
      encryptionDecryptionClient,
    );
    return userDataWithEncryptedTaxId;
  };
};

const encryptProfileTaxId = async (
  userData: UserData,
  encryptionDecryptionClient: EncryptionDecryptionClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (
    !currentBusiness.profileData.taxId ||
    currentBusiness.profileData.taxId?.includes(maskingCharacter)
  ) {
    return userData;
  }
  const maskedTaxId = maskTaxId(currentBusiness.profileData.taxId as string);
  const encryptedTaxId = await encryptionDecryptionClient.encryptValue(
    currentBusiness.profileData.taxId as string,
  );

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    profileData: {
      ...business.profileData,
      taxId: maskedTaxId,
      encryptedTaxId: encryptedTaxId,
    },
  }));
};

const encryptProfileTaxPin = async (
  userData: UserData,
  encryptionDecryptionClient: EncryptionDecryptionClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (
    !currentBusiness.profileData.taxPin ||
    currentBusiness.profileData.taxPin?.includes(maskingCharacter)
  ) {
    return userData;
  }
  const maskedTaxPin = maskingCharacter.repeat(currentBusiness.profileData.taxPin.length);
  const encryptedTaxPin = await encryptionDecryptionClient.encryptValue(
    currentBusiness.profileData.taxPin as string,
  );

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    profileData: {
      ...business.profileData,
      taxPin: maskedTaxPin,
      encryptedTaxPin: encryptedTaxPin,
    },
  }));
};

const encryptTaxClearanceTaxId = async (
  userData: UserData,
  encryptionDecryptionClient: EncryptionDecryptionClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (
    !currentBusiness.taxClearanceCertificateData?.taxId ||
    currentBusiness.taxClearanceCertificateData?.taxId?.includes(maskingCharacter)
  ) {
    return userData;
  }
  const maskedTaxId = maskTaxId(currentBusiness.taxClearanceCertificateData?.taxId as string);
  const encryptedTaxId = await encryptionDecryptionClient.encryptValue(
    currentBusiness.taxClearanceCertificateData?.taxId as string,
  );

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    taxClearanceCertificateData: business.taxClearanceCertificateData
      ? {
          ...business.taxClearanceCertificateData,
          taxId: maskedTaxId,
          encryptedTaxId: encryptedTaxId,
        }
      : undefined,
  }));
};

const encryptTaxClearanceTaxPin = async (
  userData: UserData,
  encryptionDecryptionClient: EncryptionDecryptionClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (
    !currentBusiness.taxClearanceCertificateData?.taxPin ||
    currentBusiness.taxClearanceCertificateData?.taxPin?.includes(maskingCharacter)
  ) {
    return userData;
  }
  const maskedTaxPin = maskingCharacter.repeat(4);
  const encryptedTaxPin = await encryptionDecryptionClient.encryptValue(
    currentBusiness.taxClearanceCertificateData?.taxPin as string,
  );

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    taxClearanceCertificateData: business.taxClearanceCertificateData
      ? {
          ...business.taxClearanceCertificateData,
          taxPin: maskedTaxPin,
          encryptedTaxPin: encryptedTaxPin,
        }
      : undefined,
  }));
};

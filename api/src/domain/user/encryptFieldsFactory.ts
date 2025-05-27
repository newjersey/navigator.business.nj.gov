import { CryptoClient } from "@domain/types";
import { maskTaxId } from "@domain/user/maskTaxId";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { maskingCharacter } from "@shared/profileData";
import { UserData } from "@shared/userData";

export const encryptFieldsFactory = (
  encryptionDecryptionClient: CryptoClient,
  hashingClient: CryptoClient,
): ((userData: UserData) => Promise<UserData>) => {
  return async (userData: UserData): Promise<UserData> => {
    const userDataWithHashedTaxId = await hashProfileTaxId(userData, hashingClient);
    const encryptionFunctions = [
      encryptProfileTaxId,
      encryptProfileTaxPin,
      encryptTaxClearanceTaxId,
      encryptTaxClearanceTaxPin,
    ];
    let encryptedUserData = userDataWithHashedTaxId;

    for (const encryptionFunction of encryptionFunctions) {
      encryptedUserData = await encryptionFunction(encryptedUserData, encryptionDecryptionClient);
    }
    return encryptedUserData;
  };
};

export const encryptTaxIdForBatchLambdaFactory = (
  cryptoClient: CryptoClient,
): ((userData: UserData) => Promise<UserData>) => {
  return async (userData: UserData): Promise<UserData> => {
    const userDataWithEncryptedTaxId = await encryptProfileTaxId(userData, cryptoClient);
    return userDataWithEncryptedTaxId;
  };
};

const encryptProfileTaxId = async (
  userData: UserData,
  cryptoClient: CryptoClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (
    !currentBusiness.profileData.taxId ||
    currentBusiness.profileData.taxId?.includes(maskingCharacter)
  ) {
    return userData;
  }
  const maskedTaxId = maskTaxId(currentBusiness.profileData.taxId as string);
  const encryptedTaxId = await cryptoClient.encryptValue(
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
  cryptoClient: CryptoClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (
    !currentBusiness.profileData.taxPin ||
    currentBusiness.profileData.taxPin?.includes(maskingCharacter)
  ) {
    return userData;
  }
  const maskedTaxPin = maskingCharacter.repeat(currentBusiness.profileData.taxPin.length);
  const encryptedTaxPin = await cryptoClient.encryptValue(
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
  cryptoClient: CryptoClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (
    !currentBusiness.taxClearanceCertificateData?.taxId ||
    currentBusiness.taxClearanceCertificateData?.taxId?.includes(maskingCharacter)
  ) {
    return userData;
  }
  const maskedTaxId = maskTaxId(currentBusiness.taxClearanceCertificateData?.taxId as string);
  const encryptedTaxId = await cryptoClient.encryptValue(
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
  cryptoClient: CryptoClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (
    !currentBusiness.taxClearanceCertificateData?.taxPin ||
    currentBusiness.taxClearanceCertificateData?.taxPin?.includes(maskingCharacter)
  ) {
    return userData;
  }
  const maskedTaxPin = maskingCharacter.repeat(4);
  const encryptedTaxPin = await cryptoClient.encryptValue(
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

const hashProfileTaxId = async (
  userData: UserData,
  cryptoClient: CryptoClient,
): Promise<UserData> => {
  const currentBusiness = getCurrentBusiness(userData);
  if (!currentBusiness.profileData.taxId) {
    return userData;
  }
  const hashedTaxId = await cryptoClient.hashValue(currentBusiness.profileData.taxId as string);
  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    profileData: { ...business.profileData, hashedTaxId: hashedTaxId },
  }));
};

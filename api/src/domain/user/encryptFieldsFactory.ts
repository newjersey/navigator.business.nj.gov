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
    const userDataWithEncryptedTaxId = await encryptTaxId(userData, encryptionDecryptionClient);
    const userDataWithEncryptedTaxPin = await encryptTaxPin(
      userDataWithEncryptedTaxId,
      encryptionDecryptionClient,
    );
    return userDataWithEncryptedTaxPin;
  };
};

export const encryptTaxIdForBatchLambdaFactory = (
  encryptionDecryptionClient: EncryptionDecryptionClient,
): ((userData: UserData) => Promise<UserData>) => {
  return async (userData: UserData): Promise<UserData> => {
    const userDataWithEncryptedTaxId = await encryptTaxId(userData, encryptionDecryptionClient);
    return userDataWithEncryptedTaxId;
  };
};

const encryptTaxId = async (
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

const encryptTaxPin = async (
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
  const maskedTaxPin = maskingCharacter.repeat(4);
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

import { Business } from "@shared/business";
import { getCurrentBusinessForUser, getUserDataWithUpdatedCurrentBusiness } from "@shared/businessHelpers";
import { maskingCharacter } from "@shared/profileData";
import { UserDataPrime } from "@shared/userData";
import { EncryptionDecryptionClient, EncryptTaxId } from "../types";
import { maskTaxId } from "./maskTaxId";

export const encryptTaxIdFactory = (encryptionDecryptionClient: EncryptionDecryptionClient): EncryptTaxId => {
  return async (userData: UserDataPrime): Promise<UserDataPrime> => {
    const currentBusiness = getCurrentBusinessForUser(userData);
    if (!currentBusiness.profileData.taxId || currentBusiness.profileData.taxId?.includes(maskingCharacter)) {
      return userData;
    }
    const maskedTaxId = maskTaxId(currentBusiness.profileData.taxId as string);
    const encryptedTaxId = await encryptionDecryptionClient.encryptValue(
      currentBusiness.profileData.taxId as string
    );

    const updatedBusiness: Business = {
      ...currentBusiness,
      profileData: {
        ...currentBusiness.profileData,
        taxId: maskedTaxId,
        encryptedTaxId: encryptedTaxId,
      },
    };
    return getUserDataWithUpdatedCurrentBusiness(userData, updatedBusiness);
  };
};

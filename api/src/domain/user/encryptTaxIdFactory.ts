import { maskingCharacter } from "@shared/profileData";
import { Business, UserData } from "@shared/userData";
import { EncryptionDecryptionClient, EncryptTaxId } from "../types";
import { maskTaxId } from "./maskTaxId";

export const encryptTaxIdFactory = (encryptionDecryptionClient: EncryptionDecryptionClient): EncryptTaxId => {
  return async (userData: UserData): Promise<UserData> => {
    const currentBusiness = userData.businesses[userData.currentBusinessID]
    if (!currentBusiness.profileData.taxId || currentBusiness.profileData.taxId?.includes(maskingCharacter)) {
      return userData;
    }
    const maskedTaxId = maskTaxId(currentBusiness.profileData.taxId as string);
    const encryptedTaxId = await encryptionDecryptionClient.encryptValue(
      currentBusiness.profileData.taxId as string
    );

    const updatedCurrentBusiness: Business = {
      ...currentBusiness,
      profileData: {
        ...currentBusiness.profileData,
        taxId: maskedTaxId,
        encryptedTaxId: encryptedTaxId
      }
    }
    const updatedBusinesses = {...userData.businesses}
    updatedBusinesses[userData.currentBusinessID] = updatedCurrentBusiness

    const user: UserData = {
      ...userData,
      businesses: updatedBusinesses
    };
    return user;
  };
};

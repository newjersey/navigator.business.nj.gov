import { getCurrentBusiness } from "@shared/businessHelpers";
import { maskingCharacter } from "@shared/profileData";
import { modifyCurrentBusiness } from "@shared/test";
import { UserData } from "@shared/userData";
import { EncryptionDecryptionClient, EncryptTaxId } from "../types";
import { maskTaxId } from "./maskTaxId";

export const encryptTaxIdFactory = (encryptionDecryptionClient: EncryptionDecryptionClient): EncryptTaxId => {
  return async (userData: UserData): Promise<UserData> => {
    const currentBusiness = getCurrentBusiness(userData);
    if (!currentBusiness.profileData.taxId || currentBusiness.profileData.taxId?.includes(maskingCharacter)) {
      return userData;
    }
    const maskedTaxId = maskTaxId(currentBusiness.profileData.taxId as string);
    const encryptedTaxId = await encryptionDecryptionClient.encryptValue(
      currentBusiness.profileData.taxId as string
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
};

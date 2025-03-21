import { EncryptionDecryptionClient, EncryptTaxId } from "@domain/types";
import { maskTaxId } from "@domain/user/maskTaxId";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { maskingCharacter } from "@shared/profileData";
import { UserData } from "@shared/userData";

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

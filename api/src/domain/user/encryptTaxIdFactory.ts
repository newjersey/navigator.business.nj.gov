import { maskingCharacter } from "@shared/profileData";
import { UserData } from "@shared/userData";
import { EncryptionDecryptionClient, EncryptTaxId } from "../types";
import { maskTaxId } from "./maskTaxId";

export const encryptTaxIdFactory = (encryptionDecryptionClient: EncryptionDecryptionClient): EncryptTaxId => {
  return async (userData: UserData): Promise<UserData> => {
    if (!userData.profileData.taxId || userData.profileData.taxId?.includes(maskingCharacter)) {
      return userData;
    }
    const maskedTaxId = maskTaxId(userData.profileData.taxId as string);
    const encryptedTaxId = await encryptionDecryptionClient.encryptValue(
      userData.profileData.taxId as string
    );

    const user: UserData = {
      ...userData,
      profileData: {
        ...userData.profileData,
        taxId: maskedTaxId,
        encryptedTaxId: encryptedTaxId,
      },
    };
    return user;
  };
};

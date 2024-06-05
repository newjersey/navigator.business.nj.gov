import { getSignedInUserId } from "@api/userRouter";
import { EncryptionDecryptionClient, TaxFilingInterface, UserDataClient } from "@domain/types";
import { maskingCharacter } from "@shared/profileData";
import { Router } from "express";

const getTaxId = async (
  encryptionDecryptionClient: EncryptionDecryptionClient,
  taxId: string,
  encryptedTaxId: string | undefined
): Promise<string> => {
  if (taxId.includes(maskingCharacter)) {
    if (encryptedTaxId) {
      return await encryptionDecryptionClient.decryptValue(encryptedTaxId);
    }
    throw new Error("No valid taxId");
  } else {
    return taxId;
  }
};

export const taxFilingRouterFactory = (
  userDataClient: UserDataClient,
  taxFilingInterface: TaxFilingInterface,
  encryptionDecryptionClient: EncryptionDecryptionClient
): Router => {
  const router = Router();

  router.post("/lookup", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { encryptedTaxId, taxId, businessName } = req.body;
    try {
      const plainTextTaxId = await getTaxId(encryptionDecryptionClient, taxId, encryptedTaxId);
      const userData = await userDataClient.get(userId);
      const userDataWithTaxFilingData = await taxFilingInterface.lookup({
        userData,
        taxId: plainTextTaxId,
        businessName,
      });
      const updatedUserData = await userDataClient.put(userDataWithTaxFilingData);
      res.json(updatedUserData);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.post("/onboarding", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { encryptedTaxId, taxId, businessName } = req.body;
    try {
      const plainTextTaxId = await getTaxId(encryptionDecryptionClient, taxId, encryptedTaxId);
      const userData = await userDataClient.get(userId);
      const userDataWithTaxFilingData = await taxFilingInterface.onboarding({
        userData,
        taxId: plainTextTaxId,
        businessName,
      });
      const updatedUserData = await userDataClient.put(userDataWithTaxFilingData);
      res.json(updatedUserData);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  return router;
};

import { getSignedInUserId } from "@api/userRouter";
import { DatabaseClient, EncryptionDecryptionClient, TaxFilingInterface } from "@domain/types";
import { maskingCharacter } from "@shared/profileData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

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
  dynamoDataClient: DatabaseClient,
  taxFilingInterface: TaxFilingInterface,
  encryptionDecryptionClient: EncryptionDecryptionClient
): Router => {
  const router = Router();

  router.post("/lookup", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { encryptedTaxId, taxId, businessName } = req.body;
    try {
      const plainTextTaxId = await getTaxId(encryptionDecryptionClient, taxId, encryptedTaxId);
      const userData = await dynamoDataClient.get(userId);
      const userDataWithTaxFilingData = await taxFilingInterface.lookup({
        userData,
        taxId: plainTextTaxId,
        businessName,
      });
      const updatedUserData = await dynamoDataClient.put(userDataWithTaxFilingData);
      res.json(updatedUserData);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  });

  router.post("/onboarding", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { encryptedTaxId, taxId, businessName } = req.body;
    try {
      const plainTextTaxId = await getTaxId(encryptionDecryptionClient, taxId, encryptedTaxId);
      const userData = await dynamoDataClient.get(userId);
      const userDataWithTaxFilingData = await taxFilingInterface.onboarding({
        userData,
        taxId: plainTextTaxId,
        businessName,
      });
      const updatedUserData = await dynamoDataClient.put(userDataWithTaxFilingData);
      res.json(updatedUserData);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  });

  return router;
};

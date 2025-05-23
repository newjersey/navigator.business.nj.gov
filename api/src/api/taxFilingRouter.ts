import { getSignedInUserId } from "@api/userRouter";
import { CryptoClient, DatabaseClient, TaxFilingInterface } from "@domain/types";
import { maskingCharacter } from "@shared/profileData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

const getTaxId = async (
  cryptoClient: CryptoClient,
  taxId: string,
  encryptedTaxId: string | undefined,
): Promise<string> => {
  if (taxId.includes(maskingCharacter)) {
    if (encryptedTaxId) {
      return await cryptoClient.decryptValue(encryptedTaxId);
    }
    throw new Error("No valid taxId");
  } else {
    return taxId;
  }
};

export const taxFilingRouterFactory = (
  dynamoDataClient: DatabaseClient,
  taxFilingInterface: TaxFilingInterface,
  cryptoClient: CryptoClient,
): Router => {
  const router = Router();

  router.post("/lookup", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { encryptedTaxId, taxId, businessName } = req.body;
    try {
      const plainTextTaxId = await getTaxId(cryptoClient, taxId, encryptedTaxId);
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
      const plainTextTaxId = await getTaxId(cryptoClient, taxId, encryptedTaxId);
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

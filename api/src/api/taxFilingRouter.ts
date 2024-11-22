import { getSignedInUserId } from "@api/userRouter";
import { EncryptionDecryptionClient, TaxFilingInterface, UserDataClient } from "@domain/types";
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
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  });

  router.post("/onboarding", async (req, res) => {
    console.log("POSTING TAX FILINGS ONBOARDING --- API");
    const userId = getSignedInUserId(req);
    console.log("USER ID", userId);
    const { encryptedTaxId, taxId, businessName } = req.body;
    try {
      console.log("TRYING");
      const plainTextTaxId = await getTaxId(encryptionDecryptionClient, taxId, encryptedTaxId);
      console.log("PLAIN TEXT TAX ID", plainTextTaxId);
      const userData = await userDataClient.get(userId);
      console.log("USER DATA", userData);
      const userDataWithTaxFilingData = await taxFilingInterface.onboarding({
        userData,
        taxId: plainTextTaxId,
        businessName,
      });
      console.log("USER DATA WITH TAX FILING DATA", userDataWithTaxFilingData);
      const updatedUserData = await userDataClient.put(userDataWithTaxFilingData);
      console.log("UPDATED USER DATA", updatedUserData);
      res.json(updatedUserData);
    } catch (error) {
      console.log("ERROR", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  });

  return router;
};

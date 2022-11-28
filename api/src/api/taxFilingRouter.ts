import { maskingCharacter } from "@shared/profileData";
import { Router } from "express";
import { EncryptionDecryptionClient, TaxFilingInterface, UserDataClient } from "../domain/types";
import { getSignedInUserId } from "./userRouter";

const getTaxId = async (
  encryptionDecryptionClient: EncryptionDecryptionClient,
  taxId: string,
  encryptedTaxId: string
) => {
  return encryptedTaxId === undefined && taxId.includes(maskingCharacter) === false
    ? taxId
    : await encryptionDecryptionClient.decryptValue(encryptedTaxId);
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
    const plainTextTaxId = await getTaxId(encryptionDecryptionClient, taxId, encryptedTaxId);
    try {
      let userData = await userDataClient.get(userId);
      userData = await taxFilingInterface.lookup({ userData, taxId: plainTextTaxId, businessName });
      userData = await userDataClient.put(userData);
      res.json(userData);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.post("/onboarding", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { encryptedTaxId, taxId, businessName } = req.body;
    const plainTextTaxId = await getTaxId(encryptionDecryptionClient, taxId, encryptedTaxId);
    try {
      let userData = await userDataClient.get(userId);
      userData = await taxFilingInterface.onboarding({ userData, taxId: plainTextTaxId, businessName });
      userData = await userDataClient.put(userData);
      res.json(userData);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  return router;
};

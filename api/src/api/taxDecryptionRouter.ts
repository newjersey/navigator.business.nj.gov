import { Router } from "express";
import { EncryptionDecryptionClient } from "../domain/types";

export const taxDecryptionRouterFactory = (
  encryptionDecryptionClient: EncryptionDecryptionClient,
): Router => {
  const router = Router();

  router.post("/decrypt", async (req, res) => {
    const { encryptedTaxId } = req.body;
    try {
      const plainTextTaxId = await encryptionDecryptionClient.decryptValue(encryptedTaxId);
      res.json(plainTextTaxId);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  return router;
};

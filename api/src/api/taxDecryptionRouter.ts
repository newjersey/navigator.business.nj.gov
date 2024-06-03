import { EncryptionDecryptionClient } from "@domain/types";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const taxDecryptionRouterFactory = (
  encryptionDecryptionClient: EncryptionDecryptionClient
): Router => {
  const router = Router();

  router.post("/decrypt", async (req, res) => {
    const { encryptedTaxId } = req.body;
    try {
      const plainTextTaxId = await encryptionDecryptionClient.decryptValue(encryptedTaxId);
      res.json(plainTextTaxId);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  });

  return router;
};

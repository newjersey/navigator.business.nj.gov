import { EncryptionDecryptionClient } from "@domain/types";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const decryptionRouterFactory = (
  encryptionDecryptionClient: EncryptionDecryptionClient,
): Router => {
  const router = Router();

  router.post("/decrypt", async (req, res) => {
    const { encryptedValue } = req.body;
    try {
      const plainTextValue = await encryptionDecryptionClient.decryptValue(encryptedValue);
      res.json(plainTextValue);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  });

  return router;
};

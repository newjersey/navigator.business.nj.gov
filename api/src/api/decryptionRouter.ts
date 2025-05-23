import { CryptoClient } from "@domain/types";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const decryptionRouterFactory = (cryptoClient: CryptoClient): Router => {
  const router = Router();

  router.post("/decrypt", async (req, res) => {
    const { encryptedValue } = req.body;
    try {
      const plainTextValue = await cryptoClient.decryptValue(encryptedValue);
      res.json(plainTextValue);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  });

  return router;
};

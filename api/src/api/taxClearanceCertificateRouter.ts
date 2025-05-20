import { ExpressRequestBody } from "@api/types";
import { type EncryptionDecryptionClient, TaxClearanceCertificateClient } from "@domain/types";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const taxClearanceCertificateRouterFactory = (
  taxClearanceCertificateClient: TaxClearanceCertificateClient,
  encryptionDecryptionClient: EncryptionDecryptionClient,
): Router => {
  const router = Router();
  router.post("/postTaxClearanceCertificate", async (req: ExpressRequestBody<UserData>, res) => {
    const userData = req.body;

    try {
      const response = await taxClearanceCertificateClient.postTaxClearanceCertificate(
        userData,
        encryptionDecryptionClient,
      );
      res.json(response);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  });
  return router;
};

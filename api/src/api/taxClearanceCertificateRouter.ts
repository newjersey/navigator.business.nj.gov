import { ExpressRequestBody } from "@api/types";
import { type CryptoClient, DatabaseClient, TaxClearanceCertificateClient } from "@domain/types";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const taxClearanceCertificateRouterFactory = (
  taxClearanceCertificateClient: TaxClearanceCertificateClient,
  cryptoClient: CryptoClient,
  databaseClient: DatabaseClient,
): Router => {
  const router = Router();
  router.post("/postTaxClearanceCertificate", async (req: ExpressRequestBody<UserData>, res) => {
    const userData = req.body;

    try {
      const response = await taxClearanceCertificateClient.postTaxClearanceCertificate(
        userData,
        cryptoClient,
        databaseClient,
      );
      res.json(response);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  });
  router.post("/unlinkTaxId", async (req: ExpressRequestBody<UserData>, res) => {
    const userData = req.body;

    try {
      const response = await taxClearanceCertificateClient.unlinkTaxId(userData, databaseClient);
      res.json(response);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  });
  return router;
};

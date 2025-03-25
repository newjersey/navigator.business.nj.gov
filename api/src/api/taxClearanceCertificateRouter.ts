import { ExpressRequestBody } from "@api/types";
import { TaxClearanceCertificateClient } from "@client/ApiTaxClearanceCertificateClient";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

type TaxClearanceCertificatePostBody = {
  userData: UserData;
};

export const taxClearanceCertificateRouterFactory = (
  taxClearanceCertificateClient: TaxClearanceCertificateClient
) => {
  const router = Router();
  router.post(
    "/postTaxClearanceCertificate",
    async (req: ExpressRequestBody<TaxClearanceCertificatePostBody>, res) => {
      const { userData } = req.body;

      try {
        const response = await taxClearanceCertificateClient.postTaxClearanceCertificate(userData);
        res.json(response);
      } catch (error) {
        // TODO: Missing Field Error
        // TODO: Validation Error
        // TODO: Server Error
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
      }
    }
  );
  return router;
};

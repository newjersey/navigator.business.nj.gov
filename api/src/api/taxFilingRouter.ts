import { getSignedInUserId } from "@api/userRouter";
import { CryptoClient, DatabaseClient, TaxFilingInterface } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
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
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/lookup", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { encryptedTaxId, taxId, businessName } = req.body;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    logger.LogInfo(
      `[START] ${method} ${endpoint} - userId: ${userId}, Received request to look up business by name: ${businessName}`,
    );
    try {
      const plainTextTaxId = await getTaxId(cryptoClient, taxId, encryptedTaxId);
      const userData = await dynamoDataClient.get(userId);
      const userDataWithTaxFilingData = await taxFilingInterface.lookup({
        userData,
        taxId: plainTextTaxId,
        businessName,
      });
      const updatedUserData = await dynamoDataClient.put(userDataWithTaxFilingData);
      const status = StatusCodes.OK;
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, successfully submitted tax filing lookup and updated user data for userId: ${userId}, duration: ${
          Date.now() - requestStart
        }ms`,
      );
      res.status(status).json(updatedUserData);
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : String(error);
      logger.LogError(
        `${method} ${endpoint} - Failed to submit tax filing lookup or update user data: ${message}, status: ${status}, userId: ${userId}, duration: ${
          Date.now() - requestStart
        }ms`,
      );

      res.status(status).json({ error: message });
    }
  });

  router.post("/onboarding", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { encryptedTaxId, taxId, businessName } = req.body;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    logger.LogInfo(
      `[START] ${method} ${endpoint} - userId: ${userId}, Received request to submit tax filing onboarding for businessName: ${businessName}`,
    );
    try {
      const plainTextTaxId = await getTaxId(cryptoClient, taxId, encryptedTaxId);
      const userData = await dynamoDataClient.get(userId);
      const userDataWithTaxFilingData = await taxFilingInterface.onboarding({
        userData,
        taxId: plainTextTaxId,
        businessName,
      });
      const status = StatusCodes.OK;
      const updatedUserData = await dynamoDataClient.put(userDataWithTaxFilingData);
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, successfully completed tax filing onboarding, userId: ${userId}, duration: ${
          Date.now() - requestStart
        }ms`,
      );
      res.status(status).json(updatedUserData);
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : String(error);
      logger.LogError(
        `${method} ${endpoint} - Failed to complete tax filing onboarding: ${message}, userId: ${userId}, duration: ${
          Date.now() - requestStart
        }ms`,
      );
      res.status(status).json({ error });
    }
  });

  return router;
};

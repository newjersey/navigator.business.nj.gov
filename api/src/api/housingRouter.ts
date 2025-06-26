import { HousingPropertyInterestStatus, HousingRegistrationStatus } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import {
  HousingPropertyInterestDetails,
  HousingRegistrationRequestLookupResponse,
} from "@shared/housing";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const housingRouterFactory = (
  housingPropertyInterest: HousingPropertyInterestStatus,
  housingRegistrationStatus: HousingRegistrationStatus,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/housing/properties/", async (req, res) => {
    const { address, municipalityId } = req.body;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received request to submit housing property lookup for address: ${address}, municipalityId: ${municipalityId}`,
    );
    housingPropertyInterest(address, municipalityId)
      .then(async (propertyInterestDetails?: HousingPropertyInterestDetails) => {
        const status = StatusCodes.OK;
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, successfully processed property interest lookup for address: ${address}, municipalityId: ${municipalityId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        return res.status(status).json(propertyInterestDetails);
      })
      .catch((error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to process property interest lookup: ${message}, status: ${status}, address: ${address}, municipalityId: ${municipalityId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json({ error });
      });
  });

  router.post("/housing/registrations/", async (req, res) => {
    const { address, municipalityId, propertyInterestType } = req.body;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received request to submit housing property registration for address: ${address}, municipalityId: ${municipalityId}, propertyInterestType: ${propertyInterestType}`,
    );
    housingRegistrationStatus(address, municipalityId, propertyInterestType)
      .then(async (registrations?: HousingRegistrationRequestLookupResponse) => {
        const status = StatusCodes.OK;
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, successfully submitted housing registration for address: ${address}, municipalityId: ${municipalityId}, propertyInterestType: ${propertyInterestType}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        return res.status(status).json(registrations);
      })
      .catch((error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to submit housing registration: ${message}, status: ${status}, address: ${address}, municipalityId: ${municipalityId}, propertyInterestType: ${propertyInterestType}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json({ error });
      });
  });

  return router;
};

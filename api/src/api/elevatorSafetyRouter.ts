import {
  ElevatorSafetyInspectionStatus,
  ElevatorSafetyRegistrationStatus,
  ElevatorSafetyViolationsStatus,
} from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import {
  ElevatorSafetyDeviceInspectionDetails,
  ElevatorSafetyRegistrationSummary,
} from "@shared/elevatorSafety";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const elevatorSafetyRouterFactory = (
  elevatorSafetyInspection: ElevatorSafetyInspectionStatus,
  elevatorSafetyRegistration: ElevatorSafetyRegistrationStatus,
  elevatorSafetyViolation: ElevatorSafetyViolationsStatus,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.get("/elevator-safety/inspections/:address", async (req, res) => {
    const address = req.params.address;
    const requestStart = Date.now();
    const endpoint = req.originalUrl;
    const method = req.method;

    logger.LogInfo(`[START] ${method} ${endpoint} - address: ${address}`);

    elevatorSafetyInspection(address)
      .then(async (elevatorInspections: ElevatorSafetyDeviceInspectionDetails[]) => {
        const status = StatusCodes.OK;
        res.status(status).json(elevatorInspections);
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, successfully retrieved elevator safety inspections for address: ${address}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
      })
      .catch((error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to retrieve elevator safety inspections: ${message}, status: ${status}, address: ${address}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  router.post("/elevator-safety/violations/", async (req, res) => {
    const { address, municipalityId } = req.body;
    elevatorSafetyViolation(address, municipalityId)
      .then(async (violations: boolean) => {
        return res.json(violations);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  router.post("/elevator-safety/registration/", async (req, res) => {
    const { address, municipalityId } = req.body;
    const requestStart = Date.now();
    const endpoint = req.originalUrl;
    const method = req.method;

    logger.LogInfo(
      `[START] ${method} ${endpoint} - address: ${address}, municipalityId: ${municipalityId}`,
    );

    elevatorSafetyRegistration(address, municipalityId)
      .then(async (elevatorRegistrations: ElevatorSafetyRegistrationSummary) => {
        const status = StatusCodes.OK;
        res.status(status).json(elevatorRegistrations);
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, successfully submitted elevator safety registration for address: ${address}, municipalityId: ${municipalityId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
      })
      .catch((error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Error submitting elevator safety registration: ${message}, status: ${status}, address: ${address}, municipalityId: ${municipalityId}, duration:  ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json({ error: message });
      });
  });

  return router;
};

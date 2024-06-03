import {
  ElevatorSafetyInspectionStatus,
  ElevatorSafetyRegistrationStatus,
  ElevatorSafetyViolationsStatus,
} from "@domain/types";
import {
  ElevatorSafetyDeviceInspectionDetails,
  ElevatorSafetyRegistrationSummary,
} from "@shared/elevatorSafety";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const elevatorSafetyRouterFactory = (
  elevatorSafetyInspection: ElevatorSafetyInspectionStatus,
  elevatorSafetyRegistration: ElevatorSafetyRegistrationStatus,
  elevatorSafetyViolation: ElevatorSafetyViolationsStatus
): Router => {
  const router = Router();

  router.get("/elevator-safety/inspections/:address", async (req, res) => {
    const address = req.params.address;
    elevatorSafetyInspection(address)
      .then(async (elevatorInspections: ElevatorSafetyDeviceInspectionDetails[]) => {
        return res.json(elevatorInspections);
      })
      .catch((error) => {
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
    elevatorSafetyRegistration(address, municipalityId)
      .then(async (elevatorRegistrations: ElevatorSafetyRegistrationSummary) => {
        return res.json(elevatorRegistrations);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  return router;
};

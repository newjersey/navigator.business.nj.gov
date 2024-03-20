import { ElevatorSafetyInspectionStatus, ElevatorSafetyRegistrationStatus } from "@domain/types";
import {
  ElevatorSafetyDeviceInspectionDetails,
  ElevatorSafetyRegistrationSummary,
} from "@shared/elevatorSafety";
import { Router } from "express";

export const elevatorSafetyRouterFactory = (
  elevatorSafetyInspection: ElevatorSafetyInspectionStatus,
  elevatorSafetyRegistration: ElevatorSafetyRegistrationStatus
): Router => {
  const router = Router();

  router.get("/elevator-safety/inspections/:address", async (req, res) => {
    const address = req.params.address;
    elevatorSafetyInspection(address)
      .then(async (elevatorInspections: ElevatorSafetyDeviceInspectionDetails[]) => {
        return res.json(elevatorInspections);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  router.post("/elevator-safety/registration/", async (req, res) => {
    const { address, zipCode } = req.body;
    elevatorSafetyRegistration(address, zipCode)
      .then(async (elevatorRegistrations: ElevatorSafetyRegistrationSummary) => {
        return res.json(elevatorRegistrations);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

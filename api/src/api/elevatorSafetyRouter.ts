import { ElevatorSafetyInspectionStatus } from "@domain/types";
import { ElevatorSafetyDeviceInspectionDetails } from "@shared/elevatorSafety";
import { Router } from "express";

export const elevatorSafetyRouterFactory = (
  elevatorSafetyInspection: ElevatorSafetyInspectionStatus
): Router => {
  const router = Router();

  router.get("/elevator-safety/:address", async (req, res) => {
    const address = req.params.address;
    elevatorSafetyInspection(address)
      .then(async (elevatorInspections: ElevatorSafetyDeviceInspectionDetails[]) => {
        return res.json(elevatorInspections);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

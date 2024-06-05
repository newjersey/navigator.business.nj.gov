import { FireSafetyInspectionStatus } from "@domain/types";

import { FireSafetyInspectionResult } from "@shared/fireSafety";
import { Router } from "express";

export const fireSafetyRouterFactory = (fireSafetyInspection: FireSafetyInspectionStatus): Router => {
  const router = Router();

  router.get("/fire-safety/:address", async (req, res) => {
    const address = req.params.address as string;
    fireSafetyInspection(address)
      .then(async (inspectionData: FireSafetyInspectionResult[]) => {
        return res.json(inspectionData);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

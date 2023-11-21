import { FireSafetyInspectionStatus } from "@domain/types";

import { FireSafetyInspectionResult } from "@shared/fireSafety";
import { Router } from "express";

export const fireSafetyRouterFactory = (fireSafetyInspection: FireSafetyInspectionStatus): Router => {
  const router = Router();

  router.get("/fire-safety", async (req, res) => {
    const { address: address } = req.body;
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

import { Router } from "express";
import { LicenseSearchCriteria, LicenseStatusResult, SearchLicenseStatus } from "../domain/types";

export const licenseStatusRouterFactory = (searchLicenseStatus: SearchLicenseStatus): Router => {
  const router = Router();

  router.post("/license-status", (req, res) => {
    searchLicenseStatus(req.body as LicenseSearchCriteria)
      .then((result: LicenseStatusResult) => {
        res.json(result);
      })
      .catch((error) => {
        if (error === "BAD_INPUT") {
          res.status(400).json({ error });
        } else {
          res.status(500).json({ error });
        }
      });
  });

  return router;
};

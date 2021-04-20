import { Router } from "express";
import { MunicipalityClient, MunicipalityDetail } from "../domain/types";

export const municipalityRouterFactory = (municipalityClient: MunicipalityClient): Router => {
  const router = Router();

  router.get("/municipalities/:id", (req, res) => {
    municipalityClient
      .findOne(req.params.id)
      .then((result: MunicipalityDetail) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  router.get("/municipalities", (_req, res) => {
    municipalityClient
      .findAll()
      .then((result: MunicipalityDetail[]) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

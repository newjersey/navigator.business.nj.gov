import { Router } from "express";
import { BusinessNameRepo } from "../domain/types";

export const businessNameRouterFactory = (businessNameRepo: BusinessNameRepo): Router => {
  const router = Router();

  router.get("/business-name-availability", (req, res) => {
    businessNameRepo
      .search((req.query as BusinessQueryParams).query)
      .then((similarNames: string[]) => {
        const status = similarNames.length > 0 ? "UNAVAILABLE" : "AVAILABLE";
        res.json({ status, similarNames });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

type BusinessQueryParams = {
  query: string;
};

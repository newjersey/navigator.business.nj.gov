import { Router } from "express";
import { NameAvailability, SearchBusinessName } from "../domain/types";

export const businessNameRouterFactory = (searchBusinessName: SearchBusinessName): Router => {
  const router = Router();

  router.get("/business-name-availability", (req, res) => {
    searchBusinessName((req.query as BusinessQueryParams).query)
      .then((result: NameAvailability) => {
        res.json(result);
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

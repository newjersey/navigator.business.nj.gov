import { Router } from "express";
import { BusinessNameClient, NameAvailability } from "../domain/types";

export const businessNameRouterFactory = (businessNameClient: BusinessNameClient): Router => {
  const router = Router();

  router.get("/business-name-availability", (req, res) => {
    businessNameClient
      .search((req.query as BusinessQueryParams).query)
      .then((result: NameAvailability) => {
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

type BusinessQueryParams = {
  query: string;
};

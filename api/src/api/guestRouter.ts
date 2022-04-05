import { UserData } from "@shared/userData";
import { Router } from "express";
import { getAnnualFilings } from "../domain/annual-filings/getAnnualFilings";
import { BusinessNameClient, NameAvailability } from "../domain/types";

export const guestRouterFactory = (businessNameClient: BusinessNameClient): Router => {
  const router = Router();

  router.post("/annualFilings", async (req, res) => {
    res.json(getAnnualFilings(req.body as UserData));
  });

  router.get("/business-name-availability", (req, res) => {
    console.log("got here", req);
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

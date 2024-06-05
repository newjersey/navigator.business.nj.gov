import { getAnnualFilings } from "@domain/annual-filings/getAnnualFilings";
import { TimeStampBusinessSearch } from "@domain/types";
import { UserData } from "@shared/userData";
import { Router } from "express";

export const guestRouterFactory = (timeStampBusinessSearch: TimeStampBusinessSearch): Router => {
  const router = Router();

  router.post("/annualFilings", async (req, res) => {
    res.json(getAnnualFilings(req.body as UserData));
  });

  router.get("/business-name-availability", async (req, res) => {
    timeStampBusinessSearch
      .search(req.query.query as string)
      .then((nameAvailability) => {
        res.status(200).json(nameAvailability);
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

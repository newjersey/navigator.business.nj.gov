import { getAnnualFilings } from "@domain/annual-filings/getAnnualFilings";
import { TimeStampBusinessSearch } from "@domain/types";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const guestRouterFactory = (timeStampBusinessSearch: TimeStampBusinessSearch): Router => {
  const router = Router();

  router.post("/annualFilings", async (req, res) => {
    res.json(getAnnualFilings(req.body as UserData));
  });

  router.get("/business-name-availability", async (req, res) => {
    timeStampBusinessSearch
      .search(req.query.query as string)
      .then((nameAvailability) => {
        res.status(StatusCodes.OK).json(nameAvailability);
      })
      .catch((error) => {
        if (error === "BAD_INPUT") {
          res.status(StatusCodes.BAD_REQUEST).json({ error });
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        }
      });
  });

  return router;
};

import { UserData } from "@shared/userData";
import { Router } from "express";
import { getAnnualFilings } from "../domain/annual-filings/getAnnualFilings";

export const guestRouterFactory = (): Router => {
  const router = Router();

  router.post("/annualFilings", async (req, res) => {
    res.json(getAnnualFilings(req.body as UserData));
  });

  return router;
};

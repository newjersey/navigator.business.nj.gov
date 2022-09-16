import { Router } from "express";
import { TaxFilingClient, UserDataClient } from "../domain/types";
import { getSignedInUserId } from "./userRouter";

export const taxFilingRouterFactory = (
  userDataClient: UserDataClient,
  taxFilingClient: TaxFilingClient
): Router => {
  const router = Router();

  router.post("/lookup", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { taxId, businessName } = req.body;
    let userData = await taxFilingClient.lookup({ userId, taxId, businessName });
    try {
      userData = await userDataClient.put(userData);
    } catch (error) {
      res.status(500).json({ error });
    }
    res.json(userData);
  });

  router.post("/onboarding", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { taxId, businessName } = req.body;
    let userData = await taxFilingClient.onboarding({ userId, taxId, businessName });
    try {
      userData = await userDataClient.put(userData);
    } catch (error) {
      res.status(500).json({ error });
    }
    res.json(userData);
  });

  return router;
};

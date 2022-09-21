import { Router } from "express";
import { TaxFilingInterface, UserDataClient } from "../domain/types";
import { getSignedInUserId } from "./userRouter";

export const taxFilingRouterFactory = (
  userDataClient: UserDataClient,
  taxFilingInterface: TaxFilingInterface
): Router => {
  const router = Router();

  router.post("/lookup", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { taxId, businessName } = req.body;
    try {
      let userData = await userDataClient.get(userId);
      userData = await taxFilingInterface.lookup({ userData, taxId, businessName });
      userData = await userDataClient.put(userData);
      res.json(userData);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  router.post("/onboarding", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { taxId, businessName } = req.body;
    try {
      let userData = await userDataClient.get(userId);
      userData = await taxFilingInterface.onboarding({ userData, taxId, businessName });
      userData = await userDataClient.put(userData);
      res.json(userData);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  return router;
};

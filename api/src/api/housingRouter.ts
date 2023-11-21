import { HousingPropertyInterestStatus } from "@domain/types";
import { HousingPropertyInterestDetails } from "@shared/housing";
import { Router } from "express";

export const housingRouterFactory = (housingPropertyInterest: HousingPropertyInterestStatus): Router => {
  const router = Router();

  router.get("/housing", async (req, res) => {
    const { address: address } = req.body;
    housingPropertyInterest(address)
      .then(async (propertyInterestDetails: HousingPropertyInterestDetails[]) => {
        return res.json(propertyInterestDetails);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

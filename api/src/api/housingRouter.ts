import { HousingPropertyInterestStatus } from "@domain/types";
import { HousingPropertyInterestDetails } from "@shared/housing";
import { Router } from "express";

export const housingRouterFactory = (housingPropertyInterest: HousingPropertyInterestStatus): Router => {
  const router = Router();

  router.get("/housing/:address", async (req, res) => {
    const address = req.params.address;
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

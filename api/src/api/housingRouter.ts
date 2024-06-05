import { HousingPropertyInterestStatus } from "@domain/types";
import { HousingPropertyInterestDetails } from "@shared/housing";
import { Router } from "express";

export const housingRouterFactory = (housingPropertyInterest: HousingPropertyInterestStatus): Router => {
  const router = Router();

  router.post("/housing/properties/", async (req, res) => {
    const { address, municipalityId } = req.body;
    housingPropertyInterest(address, municipalityId)
      .then(async (propertyInterestDetails?: HousingPropertyInterestDetails) => {
        return res.json(propertyInterestDetails);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

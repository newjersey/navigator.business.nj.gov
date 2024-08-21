import { HousingPropertyInterestStatus, HousingRegistrationStatus } from "@domain/types";
import { HousingPropertyInterestDetails, HousingRegistrationRequestLookupResponse } from "@shared/housing";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const housingRouterFactory = (
  housingPropertyInterest: HousingPropertyInterestStatus,
  housingRegistrationStatus: HousingRegistrationStatus
): Router => {
  const router = Router();

  router.post("/housing/properties/", async (req, res) => {
    const { address, municipalityId } = req.body;
    housingPropertyInterest(address, municipalityId)
      .then(async (propertyInterestDetails?: HousingPropertyInterestDetails) => {
        return res.json(propertyInterestDetails);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  router.post("/housing/registrations/", async (req, res) => {
    const { address, municipalityId, propertyInterestType } = req.body;
    housingRegistrationStatus(address, municipalityId, propertyInterestType)
      .then(async (registrations?: HousingRegistrationRequestLookupResponse) => {
        return res.json(registrations);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  return router;
};

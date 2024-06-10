import { HousingHotelMotelRegistrationStatus, HousingPropertyInterestStatus } from "@domain/types";
import { HousingPropertyInterestDetails, HousingRegistrationRequestLookupResponse } from "@shared/housing";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const housingRouterFactory = (
  housingPropertyInterest: HousingPropertyInterestStatus,
  housingHotelMotelRegistrationStatus: HousingHotelMotelRegistrationStatus
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

  router.post("/housing/registrations/hotelmotel", async (req, res) => {
    const { address, municipalityId } = req.body;
    housingHotelMotelRegistrationStatus(address, municipalityId)
      .then(async (registrations?: HousingRegistrationRequestLookupResponse) => {
        return res.json(registrations);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  return router;
};

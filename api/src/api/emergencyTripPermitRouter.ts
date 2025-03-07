import { ExpressRequestBody } from "@api/types";
import { EmergencyTripPermitSubmitResponse } from "@client/AbcEmergencyTripPermitHelpers";
import { EmergencyTripPermitClient } from "@domain/types";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const emergencyTripPermitRouterFactory = (
  emergencyTripPermitClient: EmergencyTripPermitClient
): Router => {
  const router = Router();

  router.post("/emergencyTripPermit", async (req: ExpressRequestBody<undefined>, res) => {
    emergencyTripPermitClient
      .apply()
      .then(async (emergencyTripPermitSubmitResponse: EmergencyTripPermitSubmitResponse) => {
        res.json(emergencyTripPermitSubmitResponse);
      })
      .catch(async () => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
      });
  });

  return router;
};

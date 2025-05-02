import { ExpressRequestBody } from "@api/types";
import { EmergencyTripPermitClient } from "@domain/types";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitSubmitResponse,
} from "@shared/emergencyTripPermit";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const emergencyTripPermitRouterFactory = (
  emergencyTripPermitClient: EmergencyTripPermitClient,
): Router => {
  const router = Router();

  router.post(
    "/emergencyTripPermit",
    async (req: ExpressRequestBody<EmergencyTripPermitApplicationInfo>, res) => {
      emergencyTripPermitClient
        .apply(req.body)
        .then(async (response: EmergencyTripPermitSubmitResponse) => {
          if ("Success" in response && response.Success) {
            res.json(response);
          } else {
            res.status(StatusCodes.BAD_REQUEST).json(response);
          }
        })
        .catch(async () => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
        });
    },
  );

  return router;
};

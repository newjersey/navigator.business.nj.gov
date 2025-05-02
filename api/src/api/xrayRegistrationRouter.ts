import { getSignedInUserId } from "@api/userRouter";
import type { DatabaseClient, UpdateXrayRegistration } from "@domain/types";
import type { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const xrayRegistrationRouterFactory = (
  updateXrayRegistrationStatus: UpdateXrayRegistration,
  databaseClient: DatabaseClient,
): Router => {
  const router = Router();

  router.post("/xray-registration", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { facilityDetails } = req.body;
    const userData = await databaseClient.get(userId);
    updateXrayRegistrationStatus(userData, facilityDetails)
      .then(async (response: UserData) => {
        const updatedUserData = await databaseClient.put(response);
        res.json(updatedUserData);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  return router;
};

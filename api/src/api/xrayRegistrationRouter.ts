import { getSignedInUserId } from "@api/userRouter";
import { DatabaseClient } from "@domain/types";
import { UserData } from "@shared/userData";
import { UpdateXrayRegistration } from "@shared/xray";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const xrayRegistrationRouterFactory = (
  updateXrayRegistrationStatusFactory: UpdateXrayRegistration,
  databaseClient: DatabaseClient
): Router => {
  const router = Router();

  router.post("/xray-registration", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { facilityDetails } = req.body;
    const userData = await databaseClient.get(userId);
    updateXrayRegistrationStatusFactory(userData, facilityDetails)
      .then(async (userData: UserData) => {
        const updatedUserData = await databaseClient.put(userData);
        console.log("router", updatedUserData);
        res.json(updatedUserData);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  return router;
};

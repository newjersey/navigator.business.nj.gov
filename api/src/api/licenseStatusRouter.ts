import { getSignedInUserId } from "@api/userRouter";
import { DatabaseClient, UpdateLicenseStatus } from "@domain/types";
import { LicenseSearchNameAndAddress } from "@shared/license";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

type LicenseStatusRequestBody = {
  nameAndAddress: LicenseSearchNameAndAddress;
};

export const licenseStatusRouterFactory = (
  updateLicenseStatus: UpdateLicenseStatus,
  databaseClient: DatabaseClient
): Router => {
  const router = Router();

  router.post("/license-status", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { nameAndAddress } = req.body as LicenseStatusRequestBody;
    const userData = await databaseClient.get(userId);
    updateLicenseStatus(userData, nameAndAddress)
      .then(async (userData: UserData) => {
        const updatedUserData = await databaseClient.put(userData);
        res.json(updatedUserData);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  return router;
};

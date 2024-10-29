import { getSignedInUserId } from "@api/userRouter";
import { UpdateLicenseStatus, UserDataClient } from "@domain/types";
import { LicenseSearchNameAndAddress, LicenseTaskId } from "@shared/license";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

type LicenseStatusRequestBody = {
  nameAndAddress: LicenseSearchNameAndAddress;
  licenseTaskId?: LicenseTaskId;
};

export const licenseStatusRouterFactory = (
  updateLicenseStatus: UpdateLicenseStatus,
  userDataClient: UserDataClient
): Router => {
  const router = Router();

  router.post("/license-status", async (req, res) => {
    const userId = getSignedInUserId(req);
    const { nameAndAddress, licenseTaskId } = req.body as LicenseStatusRequestBody;
    const userData = await userDataClient.get(userId);
    updateLicenseStatus(userData, nameAndAddress)
      .then(async (userData: UserData) => {
        const updatedUserData = await userDataClient.put(userData);
        res.json(updatedUserData);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  return router;
};

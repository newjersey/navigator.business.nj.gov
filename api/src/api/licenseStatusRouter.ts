import { getSignedInUserId } from "@api/userRouter";
import { UpdateLicenseStatus, UserDataClient } from "@domain/types";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { LicenseSearchNameAndAddress } from "@shared/license";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const licenseStatusRouterFactory = (
  updateLicenseStatus: UpdateLicenseStatus,
  userDataClient: UserDataClient
): Router => {
  const router = Router();

  router.post("/license-status", async (req, res) => {
    const userId = getSignedInUserId(req);
    const nameAndAddress = req.body as LicenseSearchNameAndAddress;
    const userData = await userDataClient.get(userId);
    updateLicenseStatus(userData, nameAndAddress)
      .then(async (userData: UserData) => {
        const updatedUserData = await userDataClient.put(userData);
        const updatedCurrentBusiness = getCurrentBusiness(updatedUserData);
        if (!updatedCurrentBusiness.licenseData || updatedCurrentBusiness.licenseData.status === "UNKNOWN") {
          res.status(StatusCodes.NOT_FOUND).json();
          return;
        }
        res.json(updatedUserData);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  });

  return router;
};

import { NameAndAddress } from "@shared/license";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { UpdateLicenseStatus, UserDataClient } from "../domain/types";
import { getSignedInUserId } from "./userRouter";

export const licenseStatusRouterFactory = (
  updateLicenseStatus: UpdateLicenseStatus,
  userDataClient: UserDataClient
): Router => {
  const router = Router();

  router.post("/license-status", async (req, res) => {
    const userId = getSignedInUserId(req);
    const nameAndAddress = req.body as NameAndAddress;
    const userData = await userDataClient.get(userId);
    updateLicenseStatus(userData, nameAndAddress)
      .then(async (userData: UserData) => {
        const updatedUserData = await userDataClient.put(userData);
        const currentBusiness = updatedUserData.businesses[userData.currentBusinessID]
        if (!currentBusiness.licenseData || currentBusiness.licenseData.status === "UNKNOWN") {
          res.status(404).json();
          return;
        }
        res.json(updatedUserData);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

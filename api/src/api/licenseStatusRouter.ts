import { NameAndAddress } from "@shared/license";
import { UserDataPrime } from "@shared/userData";
import { Router } from "express";
import { UpdateLicenseStatus, UserDataClient } from "../domain/types";
import { getSignedInUserId } from "./userRouter";

import { getCurrentBusinessForUser } from "@shared/businessHelpers";

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
      .then(async (userData: UserDataPrime) => {
        const updatedUserData = await userDataClient.put(userData);
        const updatedCurrentBusiness = getCurrentBusinessForUser(updatedUserData);
        if (!updatedCurrentBusiness.licenseData || updatedCurrentBusiness.licenseData.status === "UNKNOWN") {
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

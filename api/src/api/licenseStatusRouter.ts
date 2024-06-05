import { getSignedInUserId } from "@api/userRouter";
import { UpdateLicenseStatus, UserDataClient } from "@domain/types";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { LicenseSearchNameAndAddress } from "@shared/license";
import { UserData } from "@shared/userData";
import { Router } from "express";

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

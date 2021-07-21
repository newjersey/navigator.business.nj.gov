import { Router } from "express";
import { NameAndAddress, UpdateLicenseStatus, UserData } from "../domain/types";
import { getSignedInUserId } from "./userRouter";

export const licenseStatusRouterFactory = (updateLicenseStatus: UpdateLicenseStatus): Router => {
  const router = Router();

  router.post("/license-status", async (req, res) => {
    const userId = getSignedInUserId(req);
    const nameAndAddress = req.body as NameAndAddress;

    updateLicenseStatus(userId, nameAndAddress)
      .then((updatedUserData: UserData) => {
        if (!updatedUserData.licenseData || updatedUserData.licenseData.status === "UNKNOWN") {
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

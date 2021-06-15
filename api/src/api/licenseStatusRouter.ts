import { Router } from "express";
import {
  LicenseSearchCriteria,
  LicenseStatusResult,
  SearchLicenseStatus,
  UserHandler,
} from "../domain/types";
import { getSignedInUserId } from "./userRouter";

export const licenseStatusRouterFactory = (
  searchLicenseStatus: SearchLicenseStatus,
  userHandler: UserHandler
): Router => {
  const router = Router();

  router.post("/license-status", async (req, res) => {
    const userId = getSignedInUserId(req);
    const body = req.body as LicenseSearchCriteria;
    const nameAndAddress = {
      name: body.name,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      zipCode: body.zipCode,
    };

    await userHandler.update(userId, {
      licenseSearchData: {
        nameAndAddress,
        completedSearch: false,
      },
    });

    searchLicenseStatus(req.body as LicenseSearchCriteria)
      .then(async (result: LicenseStatusResult) => {
        await userHandler.update(userId, {
          licenseSearchData: {
            nameAndAddress,
            completedSearch: true,
          },
        });

        res.json(result);
      })
      .catch((error) => {
        if (error === "BAD_INPUT") {
          res.status(400).json({ error });
        } else {
          res.status(500).json({ error });
        }
      });
  });

  return router;
};

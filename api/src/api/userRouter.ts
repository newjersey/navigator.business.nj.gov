import { Request, Response, Router } from "express";
import { createEmptyUserData, UpdateLicenseStatus, UserData, UserDataClient } from "../domain/types";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { industryHasALicenseType } from "../domain/license-status/convertIndustryToLicenseType";
import { generateUser } from "../domain/factories";
import { calculateNextAnnualFilingDate } from "../domain/calculateNextAnnualFilingDate";

const getTokenFromHeader = (req: Request): string => {
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    return req.headers.authorization.split(" ")[1];
  }
  throw new Error("Auth header missing");
};

type CognitoJWTPayload = {
  sub: string;
  "custom:myNJUserKey": string;
  email: string;
  identities: CognitoIdentityPayload[] | undefined;
};

type CognitoIdentityPayload = {
  dateCreated: string;
  issuer: string;
  primary: string;
  providerName: string;
  providerType: string;
  userId: string;
};

export const getSignedInUserId = (req: Request): string => {
  if (process.env.DISABLE_AUTH) return "1234567890";
  const signedInUser = jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload;
  const myNJIdentityPayload = signedInUser.identities?.find((it) => it.providerName === "myNJ");
  return myNJIdentityPayload?.userId || signedInUser.sub;
};

export const userRouterFactory = (
  userDataClient: UserDataClient,
  updateLicenseStatus: UpdateLicenseStatus
): Router => {
  const router = Router();

  router.get("/users/:userId", (req, res) => {
    const signedInUserId = getSignedInUserId(req);
    if (signedInUserId !== req.params.userId) {
      res.status(403).json();
      return;
    }

    userDataClient
      .get(req.params.userId)
      .then((userData: UserData) => {
        if (userData.licenseData && shouldCheckLicense(userData)) {
          updateLicenseStatus(userData.user.id, userData.licenseData.nameAndAddress);
        }
        res.json(userData);
      })
      .catch((error) => {
        if (error === "Not found") {
          if (process.env.IS_OFFLINE || process.env.DISABLE_AUTH) {
            saveEmptyUserData(req, res, signedInUserId);
          } else {
            res.status(404).json({ error });
          }
        } else {
          res.status(500).json({ error });
        }
      });
  });

  router.post("/users", (req, res) => {
    let userData = req.body as UserData;
    const postedUserBodyId = userData.user.id;
    if (getSignedInUserId(req) !== postedUserBodyId) {
      res.status(403).json();
      return;
    }

    if (userData.onboardingData.dateOfFormation) {
      const annualFilingDate = calculateNextAnnualFilingDate(userData.onboardingData.dateOfFormation);
      userData = {
        ...userData,
        taxFilings: [{ identifier: "ANNUAL_FILING", dueDate: annualFilingDate }],
      };
    }

    userDataClient
      .put(userData)
      .then((result: UserData) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  const shouldCheckLicense = (userData: UserData): boolean =>
    userData.licenseData !== undefined &&
    industryHasALicenseType(userData.onboardingData.industryId) &&
    hasBeenMoreThanOneHour(userData.licenseData.lastCheckedStatus);

  const hasBeenMoreThanOneHour = (lastCheckedDate: string): boolean =>
    dayjs(lastCheckedDate).isBefore(dayjs().subtract(1, "hour"));

  const saveEmptyUserData = (req: Request, res: Response, signedInUserId: string): void => {
    const signedInUser = process.env.DISABLE_AUTH
      ? generateUser({ id: "1234567890" })
      : (jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload);
    const emptyUserData = createEmptyUserData({
      myNJUserKey: signedInUserId,
      email: signedInUser.email,
      id: signedInUserId,
      name: "Test User",
    });
    userDataClient
      .put(emptyUserData)
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  };

  return router;
};

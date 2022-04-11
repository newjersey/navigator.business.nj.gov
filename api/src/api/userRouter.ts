import { decideABExperience } from "@shared/businessUser";
import { createEmptyUserData, UserData } from "@shared/userData";
import dayjs from "dayjs";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { getAnnualFilings } from "../domain/annual-filings/getAnnualFilings";
import { industryHasALicenseType } from "../domain/license-status/convertIndustryToLicenseType";
import { UpdateLicenseStatus, UserDataClient } from "../domain/types";

const getTokenFromHeader = (req: Request): string => {
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    return req.headers.authorization.split(" ")[1];
  }
  throw new Error("Auth header missing");
};

type CognitoJWTPayload = {
  sub: string;
  "custom:myNJUserKey": string;
  "custom:identityId": string | undefined;
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

export const getSignedInUser = (req: Request): CognitoJWTPayload =>
  jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload;

export const getSignedInUserId = (req: Request): string => {
  const signedInUser = getSignedInUser(req);
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
          if (process.env.IS_OFFLINE || process.env.STAGE === "dev") {
            saveEmptyUserData(req, res, signedInUserId);
          } else {
            res.status(404).json({ error });
          }
        } else {
          res.status(500).json({ error });
        }
      });
  });

  router.post("/users", async (req, res) => {
    let userData = req.body as UserData;
    const postedUserBodyId = userData.user.id;

    if (getSignedInUserId(req) !== postedUserBodyId) {
      res.status(403).json();
      return;
    }

    if (await industryHasChanged(userData)) {
      userData = clearTaskItemChecklists(userData);
    }

    userData = getAnnualFilings(userData);

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
    industryHasALicenseType(userData.profileData.industryId) &&
    hasBeenMoreThanOneHour(userData.licenseData.lastCheckedStatus);

  const hasBeenMoreThanOneHour = (lastCheckedDate: string): boolean =>
    dayjs(lastCheckedDate).isBefore(dayjs().subtract(1, "hour"));

  const industryHasChanged = (userData: UserData): Promise<boolean> => {
    return userDataClient
      .get(userData.user.id)
      .then((oldUserData) => {
        return oldUserData.profileData.industryId !== userData.profileData.industryId;
      })
      .catch(() => {
        return false;
      });
  };

  const clearTaskItemChecklists = (userData: UserData): UserData => {
    return {
      ...userData,
      taskItemChecklist: {},
    };
  };

  const saveEmptyUserData = (req: Request, res: Response, signedInUserId: string): void => {
    const signedInUser = jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload;

    const emptyUserData = createEmptyUserData({
      myNJUserKey: signedInUserId,
      email: signedInUser.email,
      id: signedInUserId,
      name: "Test User",
      externalStatus: {},
      receiveNewsletter: true,
      userTesting: true,
      abExperience: decideABExperience(),
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

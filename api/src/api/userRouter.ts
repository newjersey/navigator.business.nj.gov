import { Request, Router } from "express";
import { createEmptyUserData, UpdateLicenseStatus, UserData, UserDataClient } from "../domain/types";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";

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
        // TODO: remove this once self-reg is in place
        if (error === "Not found") {
          const signedInUser = jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload;
          const emptyUserData = createEmptyUserData({
            myNJUserKey: signedInUserId,
            email: signedInUser.email,
            id: signedInUserId,
            name: "",
          });
          userDataClient
            .put(emptyUserData)
            .then((result) => {
              res.json(result);
            })
            .catch(() => {
              res.status(500).json({ error });
            });
        } else {
          res.status(500).json({ error });
        }
      });
  });

  router.post("/users", (req, res) => {
    const postedUserBodyId = (req.body as UserData).user.id;
    if (getSignedInUserId(req) !== postedUserBodyId) {
      res.status(403).json();
      return;
    }

    userDataClient
      .put(req.body)
      .then((result: UserData) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  const shouldCheckLicense = (userData: UserData): boolean =>
    userData.onboardingData.industry !== undefined &&
    userData.licenseData !== undefined &&
    hasBeenMoreThanOneHour(userData.licenseData.lastCheckedStatus);

  const hasBeenMoreThanOneHour = (lastCheckedDate: string): boolean =>
    dayjs(lastCheckedDate).isBefore(dayjs().subtract(1, "hour"));

  return router;
};

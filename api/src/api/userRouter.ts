import { decideABExperience } from "@shared/businessUser";
import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import {
  corpLegalStructures,
  createEmptyFormationAddress,
  createEmptyFormationFormData,
  FormationLegalType,
} from "@shared/formationData";
import { createEmptyUserData, UserData } from "@shared/userData";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { getAnnualFilings } from "../domain/annual-filings/getAnnualFilings";
import { industryHasALicenseType } from "../domain/license-status/convertIndustryToLicenseType";
import {
  UpdateLicenseStatus,
  UpdateOperatingPhase,
  UpdateSidebarCards,
  UserDataClient,
} from "../domain/types";

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

const hasBeenMoreThanOneHour = (lastCheckedDate: string): boolean =>
  parseDate(lastCheckedDate).isBefore(getCurrentDate().subtract(1, "hour"));

const clearTaskItemChecklists = (userData: UserData): UserData => {
  return {
    ...userData,
    taskItemChecklist: {},
  };
};

const shouldCheckLicense = (userData: UserData): boolean =>
  userData.licenseData !== undefined &&
  industryHasALicenseType(userData.profileData.industryId) &&
  hasBeenMoreThanOneHour(userData.licenseData.lastCheckedStatus);

export const getSignedInUser = (req: Request): CognitoJWTPayload =>
  jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload;

export const getSignedInUserId = (req: Request): string => {
  const signedInUser = getSignedInUser(req);
  const myNJIdentityPayload = signedInUser.identities?.find((it) => it.providerName === "myNJ");
  return myNJIdentityPayload?.userId || signedInUser.sub;
};

const legalStructureHasChanged = (oldUserData: UserData, newUserData: UserData): boolean => {
  return oldUserData.profileData.legalStructureId !== newUserData.profileData.legalStructureId;
};

const businessHasFormed = (userData: UserData): boolean => {
  return userData.formationData.getFilingResponse?.success ?? false;
};

export const userRouterFactory = (
  userDataClient: UserDataClient,
  updateLicenseStatus: UpdateLicenseStatus,
  updateRoadmapSidebarCards: UpdateSidebarCards,
  updateOperatingPhase: UpdateOperatingPhase
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
      .then(async (userData: UserData) => {
        if (userData.licenseData && shouldCheckLicense(userData)) {
          await updateLicenseStatus(userData.user.id, userData.licenseData.nameAndAddress);
        }
        const updatedOperatingPhaseData = updateOperatingPhase(userData);
        const updatedUserData = updateRoadmapSidebarCards(updatedOperatingPhaseData);
        await userDataClient.put(updatedUserData);
        res.json(updatedUserData);
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

    userData = await updateLegalStructureIfNeeded(userData);
    userData = getAnnualFilings(userData);
    userData = updateOperatingPhase(userData);
    userData = updateRoadmapSidebarCards(userData);

    userDataClient
      .put(userData)
      .then((result: UserData) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  const industryHasChanged = async (userData: UserData): Promise<boolean> => {
    try {
      const oldUserData = await userDataClient.get(userData.user.id);
      return oldUserData.profileData.industryId !== userData.profileData.industryId;
    } catch {
      return false;
    }
  };

  const updateLegalStructureIfNeeded = async (userData: UserData): Promise<UserData> => {
    let oldUserData;
    try {
      oldUserData = await userDataClient.get(userData.user.id);
    } catch {
      return userData;
    }

    if (await legalStructureHasChanged(oldUserData, userData)) {
      // prevent legal structure from changing is business has been formed
      if (await businessHasFormed(oldUserData)) {
        userData = {
          ...userData,
          profileData: {
            ...userData.profileData,
            legalStructureId: oldUserData.profileData.legalStructureId,
          },
        };
      } else {
        userData = {
          ...userData,
          formationData: {
            formationResponse: undefined,
            getFilingResponse: undefined,
            completedFilingPayment: false,
            formationFormData: createEmptyFormationFormData(),
          },
        };

        if (
          ![...corpLegalStructures, "limited-partnership"].includes(
            userData.profileData.legalStructureId as FormationLegalType
          ) &&
          userData.formationData.formationFormData.signers.length === 0
        ) {
          userData.formationData.formationFormData.signers.push(createEmptyFormationAddress());
        }
      }
    }

    return userData;
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

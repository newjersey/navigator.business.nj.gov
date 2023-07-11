import { Business } from "@shared/business";
import { getCurrentBusinessForUser, getUserDataWithUpdatedCurrentBusiness } from "@shared/businessHelpers";
import { NameAvailability } from "@shared/businessNameSearch";
import { decideABExperience } from "@shared/businessUser";
import { getCurrentDate, getCurrentDateISOString, parseDate } from "@shared/dateHelpers";
import { createEmptyFormationFormData } from "@shared/formationData";
import { createEmptyUserDataPrime, UserDataPrime } from "@shared/userData";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { getAnnualFilings } from "../domain/annual-filings/getAnnualFilings";
import { industryHasALicenseType } from "../domain/license-status/convertIndustryToLicenseType";
import {
  EncryptionDecryptionClient,
  TimeStampBusinessSearch,
  UpdateLicenseStatus,
  UpdateOperatingPhase,
  UpdateSidebarCards,
  UserDataClient,
} from "../domain/types";
import { encryptTaxIdFactory } from "../domain/user/encryptTaxIdFactory";

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

const hasBeenMoreThanOneHour = (lastCheckedDate: string): boolean => {
  return parseDate(lastCheckedDate).isBefore(getCurrentDate().subtract(1, "hour"));
};

const clearTaskItemChecklists = (userData: UserDataPrime): UserDataPrime => {
  const updatedBusiness: Business = { ...getCurrentBusinessForUser(userData), taskItemChecklist: {} };
  return getUserDataWithUpdatedCurrentBusiness(userData, updatedBusiness);
};

const shouldCheckLicense = (userData: UserDataPrime): boolean => {
  const currentBusiness = getCurrentBusinessForUser(userData);
  return (
    currentBusiness.licenseData !== undefined &&
    industryHasALicenseType(currentBusiness.profileData.industryId) &&
    hasBeenMoreThanOneHour(currentBusiness.licenseData.lastUpdatedISO)
  );
};

const shouldUpdateBusinessNameSearch = (userData: UserDataPrime): boolean => {
  const currentBusiness = getCurrentBusinessForUser(userData);
  if (
    !currentBusiness.formationData.businessNameAvailability?.lastUpdatedTimeStamp &&
    !currentBusiness.formationData.dbaBusinessNameAvailability?.lastUpdatedTimeStamp
  ) {
    return false;
  }

  const dbaNameIsOlderThanAnHour =
    currentBusiness.profileData.nexusDbaName !== undefined &&
    currentBusiness.formationData.dbaBusinessNameAvailability !== undefined &&
    hasBeenMoreThanOneHour(currentBusiness.formationData.dbaBusinessNameAvailability.lastUpdatedTimeStamp);

  const businessNameIsOlderThanAnHour =
    currentBusiness.profileData.businessName !== undefined &&
    currentBusiness.formationData.businessNameAvailability !== undefined &&
    hasBeenMoreThanOneHour(currentBusiness.formationData.businessNameAvailability.lastUpdatedTimeStamp);

  const isDba = currentBusiness.profileData.needsNexusDbaName;
  const shouldUpdateNameAvailability = isDba ? dbaNameIsOlderThanAnHour : businessNameIsOlderThanAnHour;

  return shouldUpdateNameAvailability && currentBusiness.formationData.completedFilingPayment !== true;
};

export const getSignedInUser = (req: Request): CognitoJWTPayload => {
  return jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload;
};

export const getSignedInUserId = (req: Request): string => {
  const signedInUser = getSignedInUser(req);
  const myNJIdentityPayload = signedInUser.identities?.find((it) => {
    return it.providerName === "myNJ";
  });
  return myNJIdentityPayload?.userId || signedInUser.sub;
};

const legalStructureHasChanged = (oldUserData: UserDataPrime, newUserData: UserDataPrime): boolean => {
  return (
    getCurrentBusinessForUser(oldUserData).profileData.legalStructureId !==
    getCurrentBusinessForUser(newUserData).profileData.legalStructureId
  );
};

const businessHasFormed = (userData: UserDataPrime): boolean => {
  return getCurrentBusinessForUser(userData).formationData.getFilingResponse?.success ?? false;
};

export const userRouterFactory = (
  userDataClient: UserDataClient,
  updateLicenseStatus: UpdateLicenseStatus,
  updateRoadmapSidebarCards: UpdateSidebarCards,
  updateOperatingPhase: UpdateOperatingPhase,
  encryptionDecryptionClient: EncryptionDecryptionClient,
  timeStampBusinessSearch: TimeStampBusinessSearch
): Router => {
  const router = Router();
  const encryptTaxId = encryptTaxIdFactory(encryptionDecryptionClient);

  router.get("/users/:userId", (req, res) => {
    const signedInUserId = getSignedInUserId(req);
    if (signedInUserId !== req.params.userId) {
      res.status(403).json();
      return;
    }

    userDataClient
      .get(req.params.userId)
      .then(async (userData: UserDataPrime) => {
        let updatedUserData = userData;
        updatedUserData = await updateBusinessNameSearchIfNeeded(updatedUserData);
        updatedUserData = updateOperatingPhase(updatedUserData);
        updatedUserData = updateRoadmapSidebarCards(updatedUserData);
        await userDataClient.put(updatedUserData);
        asyncUpdateAndSaveLicenseStatusIfNeeded(updatedUserData);
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
    let userData = req.body as UserDataPrime;
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
    userData = await encryptTaxId(userData);
    userData = setLastUpdatedISO(userData);

    userDataClient
      .put(userData)
      .then((result: UserDataPrime) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  const industryHasChanged = async (userData: UserDataPrime): Promise<boolean> => {
    try {
      const oldUserData = await userDataClient.get(userData.user.id);
      const oldBusinessData = getCurrentBusinessForUser(oldUserData);
      const currentBusinessData = getCurrentBusinessForUser(userData);

      return oldBusinessData.profileData.industryId !== currentBusinessData.profileData.industryId;
    } catch {
      return false;
    }
  };

  const updateLegalStructureIfNeeded = async (userData: UserDataPrime): Promise<UserDataPrime> => {
    let oldUserData;
    try {
      oldUserData = await userDataClient.get(userData.user.id);
    } catch {
      return userData;
    }

    if (legalStructureHasChanged(oldUserData, userData)) {
      // prevent legal structure from changing if business has been formed

      if (businessHasFormed(oldUserData)) {
        const oldBusiness = getCurrentBusinessForUser(oldUserData);
        const currentBusiness = getCurrentBusinessForUser(userData);
        const updatedBusiness: Business = {
          ...currentBusiness,
          profileData: {
            ...currentBusiness.profileData,
            legalStructureId: oldBusiness.profileData.legalStructureId,
          },
        };

        return getUserDataWithUpdatedCurrentBusiness(userData, updatedBusiness);
      }

      const currentBusiness: Business = {
        ...getCurrentBusinessForUser(userData),
        formationData: {
          formationResponse: undefined,
          getFilingResponse: undefined,
          completedFilingPayment: false,
          formationFormData: createEmptyFormationFormData(),
          businessNameAvailability: undefined,
          dbaBusinessNameAvailability: undefined,
          lastVisitedPageIndex: 0,
        },
      };

      return getUserDataWithUpdatedCurrentBusiness(userData, currentBusiness);
    }

    return userData;
  };

  const saveEmptyUserData = (req: Request, res: Response, signedInUserId: string): void => {
    const signedInUser = jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload;

    const emptyUserData = createEmptyUserDataPrime({
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

  const updateBusinessNameSearchIfNeeded = async (userData: UserDataPrime): Promise<UserDataPrime> => {
    if (!shouldUpdateBusinessNameSearch(userData)) {
      return userData;
    }
    try {
      const currentBusiness = getCurrentBusinessForUser(userData);
      const isForeign = currentBusiness.profileData.businessPersona === "FOREIGN";
      const needsDba = currentBusiness.profileData.needsNexusDbaName;
      const nameToSearch = needsDba
        ? currentBusiness.profileData.nexusDbaName
        : currentBusiness.profileData.businessName;
      const response = await timeStampBusinessSearch.search(nameToSearch);

      const nameAvailability: NameAvailability = {
        status: response.status,
        similarNames: response.similarNames ?? [],
        lastUpdatedTimeStamp: response.lastUpdatedTimeStamp,
        invalidWord: response.invalidWord,
      };

      const nameIsAvailable = response.status === "AVAILABLE";
      const needsNexusDbaName = isForeign && !needsDba ? !nameIsAvailable : needsDba;

      const updatedBusiness: Business = {
        ...currentBusiness,
        profileData: {
          ...currentBusiness.profileData,
          needsNexusDbaName,
        },
        formationData: {
          ...currentBusiness.formationData,
          businessNameAvailability: needsDba
            ? currentBusiness.formationData.businessNameAvailability
            : nameAvailability,
          dbaBusinessNameAvailability: needsDba
            ? nameAvailability
            : currentBusiness.formationData.dbaBusinessNameAvailability,
        },
      };

      return getUserDataWithUpdatedCurrentBusiness(userData, updatedBusiness);
    } catch {
      return userData;
    }
  };

  const asyncUpdateAndSaveLicenseStatusIfNeeded = async (userData: UserDataPrime): Promise<void> => {
    const currentBusinessLicenseData = getCurrentBusinessForUser(userData).licenseData;
    if (!currentBusinessLicenseData || !shouldCheckLicense(userData)) {
      return;
    }
    try {
      const updatedUserData = await updateLicenseStatus(userData, currentBusinessLicenseData.nameAndAddress);
      await userDataClient.put(updatedUserData);
    } catch {
      return;
    }
  };

  return router;
};

const setLastUpdatedISO = (userData: UserDataPrime): UserDataPrime => {
  const updatedBusiness: Business = {
    ...getCurrentBusinessForUser(userData),
    lastUpdatedISO: getCurrentDateISOString(),
  };
  const updatedUserData: UserDataPrime = { ...userData, lastUpdatedISO: getCurrentDateISOString() };
  return getUserDataWithUpdatedCurrentBusiness(updatedUserData, updatedBusiness);
};

import { getAnnualFilings } from "@domain/annual-filings/getAnnualFilings";
import { industryHasALicenseType } from "@domain/license-status/convertIndustryToLicenseType";
import {
  EncryptionDecryptionClient,
  TimeStampBusinessSearch,
  UpdateLicenseStatus,
  UpdateOperatingPhase,
  UpdateSidebarCards,
  UserDataClient,
} from "@domain/types";
import { encryptTaxIdFactory } from "@domain/user/encryptTaxIdFactory";
import { NameAvailability } from "@shared/businessNameSearch";
import { decideABExperience } from "@shared/businessUser";
import { getCurrentDate, getCurrentDateISOString, parseDate } from "@shared/dateHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { createEmptyFormationFormData } from "@shared/formationData";
import { modifyCurrentBusiness } from "@shared/test";
import { UserData, createEmptyUserData } from "@shared/userData";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

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

const clearTaskItemChecklists = (userData: UserData): UserData => {
  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    taskItemChecklist: {},
  }));
};

const shouldCheckLicense = (userData: UserData): boolean => {
  const currentBusiness = getCurrentBusiness(userData);
  return (
    currentBusiness.licenseData !== undefined &&
    industryHasALicenseType(currentBusiness.profileData.industryId) &&
    hasBeenMoreThanOneHour(currentBusiness.licenseData.lastUpdatedISO)
  );
};

const shouldUpdateBusinessNameSearch = (userData: UserData): boolean => {
  const currentBusiness = getCurrentBusiness(userData);
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

const legalStructureHasChanged = (oldUserData: UserData, newUserData: UserData): boolean => {
  return (
    getCurrentBusiness(oldUserData).profileData.legalStructureId !==
    getCurrentBusiness(newUserData).profileData.legalStructureId
  );
};

const businessHasFormed = (userData: UserData): boolean => {
  return getCurrentBusiness(userData).formationData.getFilingResponse?.success ?? false;
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
      res.status(StatusCodes.FORBIDDEN).json();
      return;
    }

    userDataClient
      .get(req.params.userId)
      .then(async (userData: UserData) => {
        let updatedUserData = userData;
        updatedUserData = await updateBusinessNameSearchIfNeeded(updatedUserData);
        updatedUserData = updateOperatingPhase(updatedUserData);
        updatedUserData = updateRoadmapSidebarCards(updatedUserData);
        await userDataClient.put(updatedUserData);
        asyncUpdateAndSaveLicenseStatusIfNeeded(updatedUserData);
        res.json(updatedUserData);
      })
      .catch((error: Error) => {
        if (error.message === "Not found") {
          if (process.env.IS_OFFLINE || process.env.STAGE === "dev") {
            saveEmptyUserData(req, res, signedInUserId);
          } else {
            res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
          }
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
      });
  });

  router.post("/users", async (req, res) => {
    let userData = req.body as UserData;
    const postedUserBodyId = userData.user.id;

    if (getSignedInUserId(req) !== postedUserBodyId) {
      res.status(StatusCodes.FORBIDDEN).json();
      return;
    }

    if (await industryHasChanged(userData)) {
      userData = clearTaskItemChecklists(userData);
    }

    const userDataWithUpdatedLegalStructure = await updateLegalStructureIfNeeded(userData);
    const userDataWithAnnualFilings = getAnnualFilings(userDataWithUpdatedLegalStructure);
    const userDataWithUpdatedOperatingPhase = updateOperatingPhase(userDataWithAnnualFilings);
    const userDataWithUpdatedSidebarCards = updateRoadmapSidebarCards(userDataWithUpdatedOperatingPhase);
    const userDataWithEncryptedTaxId = await encryptTaxId(userDataWithUpdatedSidebarCards);
    const userDataWithUpdatedISO = setLastUpdatedISO(userDataWithEncryptedTaxId);

    userDataClient
      .put(userDataWithUpdatedISO)
      .then((result: UserData) => {
        res.json(result);
      })
      .catch((error: Error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
      });
  });

  const industryHasChanged = async (userData: UserData): Promise<boolean> => {
    try {
      const oldUserData = await userDataClient.get(userData.user.id);
      const oldBusinessData = getCurrentBusiness(oldUserData);
      const currentBusinessData = getCurrentBusiness(userData);

      return oldBusinessData.profileData.industryId !== currentBusinessData.profileData.industryId;
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

    if (legalStructureHasChanged(oldUserData, userData)) {
      // prevent legal structure from changing if business has been formed

      if (businessHasFormed(oldUserData)) {
        const oldBusiness = getCurrentBusiness(oldUserData);

        return modifyCurrentBusiness(userData, (business) => ({
          ...business,
          profileData: {
            ...business.profileData,
            legalStructureId: oldBusiness.profileData.legalStructureId,
          },
        }));
      }

      return modifyCurrentBusiness(userData, (business) => ({
        ...business,
        formationData: {
          formationResponse: undefined,
          getFilingResponse: undefined,
          completedFilingPayment: false,
          formationFormData: createEmptyFormationFormData(),
          businessNameAvailability: undefined,
          dbaBusinessNameAvailability: undefined,
          lastVisitedPageIndex: 0,
        },
      }));
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
      accountCreationSource: "Test Source",
      contactSharingWithAccountCreationPartner: true,
    });

    userDataClient
      .put(emptyUserData)
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
      });
  };

  const updateBusinessNameSearchIfNeeded = async (userData: UserData): Promise<UserData> => {
    if (!shouldUpdateBusinessNameSearch(userData)) {
      return userData;
    }
    try {
      const currentBusiness = getCurrentBusiness(userData);
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

      return modifyCurrentBusiness(userData, (business) => ({
        ...business,
        profileData: {
          ...business.profileData,
          needsNexusDbaName,
        },
        formationData: {
          ...business.formationData,
          businessNameAvailability: needsDba
            ? business.formationData.businessNameAvailability
            : nameAvailability,
          dbaBusinessNameAvailability: needsDba
            ? nameAvailability
            : business.formationData.dbaBusinessNameAvailability,
        },
      }));
    } catch {
      return userData;
    }
  };

  const asyncUpdateAndSaveLicenseStatusIfNeeded = async (userData: UserData): Promise<void> => {
    const currentBusinessLicenseData = getCurrentBusiness(userData).licenseData;
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

const setLastUpdatedISO = (userData: UserData): UserData => {
  const updatedUserData: UserData = { ...userData, lastUpdatedISO: getCurrentDateISOString() };
  return modifyCurrentBusiness(updatedUserData, (business) => ({
    ...business,
    lastUpdatedISO: getCurrentDateISOString(),
  }));
};

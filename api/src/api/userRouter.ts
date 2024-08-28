import { getAnnualFilings } from "@domain/annual-filings/getAnnualFilings";
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
import { LicenseName, LicenseSearchNameAndAddress } from "@shared/license";
import { modifyCurrentBusiness } from "@shared/test";
import { Business, createEmptyUserData, UserData } from "@shared/userData";
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

const shouldCheckLicense = (currentBusiness: Business): boolean => {
  const formationFormData = currentBusiness.formationData.formationFormData;
  const hasFormationAddress =
    formationFormData.addressLine1.length > 0 && formationFormData.addressZipCode.length > 0;

  const hasLicenseDataOrFormationAddress =
    currentBusiness.licenseData?.licenses !== undefined || hasFormationAddress;
  const licenseDataOlderThanOneHour =
    currentBusiness.licenseData === undefined
      ? true
      : hasBeenMoreThanOneHour(currentBusiness.licenseData.lastUpdatedISO);

  return hasLicenseDataOrFormationAddress && licenseDataOlderThanOneHour;
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
        updatedUserData = await updateBusinessNameSearchIfNeeded(updatedUserData)
          .then((userData) => updateOperatingPhase(userData))
          .then((userData) => updateRoadmapSidebarCards(userData))
          .then((userData) => asyncUpdateLicenseStatus(userData));

        await userDataClient.put(updatedUserData);
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

      const formationFormData =
        userData.businesses[userData.currentBusinessId].formationData.formationFormData;
      const address = {
        addressLine1: formationFormData.addressLine1,
        addressLine2: formationFormData.addressLine2,
        addressCity: formationFormData.addressCity,
        addressMunicipality: formationFormData.addressMunicipality,
        addressZipCode: formationFormData.addressZipCode,
      };
      return modifyCurrentBusiness(userData, (business) => ({
        ...business,
        formationData: {
          formationResponse: undefined,
          getFilingResponse: undefined,
          completedFilingPayment: false,
          formationFormData: {
            ...createEmptyFormationFormData(),
            ...address,
          },
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

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const asyncUpdateLicenseStatus = async (userData: UserData): Promise<UserData> => {
    const currentBusiness = getCurrentBusiness(userData);

    if (!shouldCheckLicense(currentBusiness)) return userData;

    try {
      let nameAndAddress: LicenseSearchNameAndAddress;
      const licenses = currentBusiness.licenseData?.licenses;
      if (licenses) {
        const [firstLicenseName] = Object.keys(licenses) as LicenseName[];
        const licenseNameAndAddress = licenses[firstLicenseName]?.nameAndAddress;
        nameAndAddress = licenseNameAndAddress!;
      } else {
        nameAndAddress = {
          name: currentBusiness.profileData.businessName,
          addressLine1: currentBusiness.formationData.formationFormData.addressLine1,
          addressLine2: currentBusiness.formationData.formationFormData.addressLine2,
          zipCode: currentBusiness.formationData.formationFormData.addressZipCode,
        };
      }

      return await updateLicenseStatus(userData, nameAndAddress);
    } catch {
      const updatedBusiness: Business = {
        ...currentBusiness,
        licenseData: {
          lastUpdatedISO: getCurrentDateISOString(),
          licenses: currentBusiness.licenseData?.licenses,
        },
      };

      const updatedUserData: UserData = {
        ...userData,
        businesses: {
          ...userData.businesses,
          [currentBusiness.id]: {
            ...updatedBusiness,
          },
        },
      };
      return updatedUserData;
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

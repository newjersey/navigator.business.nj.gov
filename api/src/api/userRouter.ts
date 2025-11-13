import { getAnnualFilings } from "@domain/annual-filings/getAnnualFilings";
import {
  CryptoClient,
  DatabaseClient,
  TimeStampBusinessSearch,
  UpdateLicenseStatus,
  UpdateOperatingPhase,
  UpdateSidebarCards,
  UpdateXrayRegistration,
} from "@domain/types";
import { encryptFieldsFactory } from "@domain/user/encryptFieldsFactory";
import type { LogWriterType } from "@libs/logWriter";
import { NameAvailability } from "@shared/businessNameSearch";
import { decideABExperience } from "@shared/businessUser";
import { getCurrentDate, getCurrentDateISOString, parseDate } from "@shared/dateHelpers";
import { determineIfNexusDbaNameNeeded } from "@shared/domain-logic/businessPersonaHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { createEmptyFormationFormData, FormationAddress } from "@shared/formationData";
import { LicenseName, LicenseSearchNameAndAddress } from "@shared/license";
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

const hasBeenMoreThanOneDay = (lastCheckedDate: string): boolean => {
  return parseDate(lastCheckedDate).isBefore(getCurrentDate().subtract(1, "day"));
};

const clearTaskItemChecklists = (userData: UserData): UserData => {
  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    taskItemChecklist: {},
  }));
};

const shouldCheckLicense = (currentBusiness: Business): boolean => {
  const formationFormData = currentBusiness.formationData.formationFormData;
  const hasFormationAddressAndBusinessName =
    formationFormData.addressLine1.length > 0 &&
    formationFormData.addressZipCode.length > 0 &&
    !!currentBusiness.profileData.businessName;

  const hasLicenseDataOrFormationAddress =
    currentBusiness.licenseData?.licenses !== undefined || hasFormationAddressAndBusinessName;
  const licenseDataOlderThanOneHour =
    currentBusiness.licenseData === undefined
      ? true
      : hasBeenMoreThanOneHour(currentBusiness.licenseData.lastUpdatedISO);

  return hasLicenseDataOrFormationAddress && licenseDataOlderThanOneHour;
};

const shouldCheckXrayRegistration = (currentBusiness: Business): boolean =>
  currentBusiness.xrayRegistrationData !== undefined &&
  currentBusiness.xrayRegistrationData.lastUpdatedISO !== undefined &&
  hasBeenMoreThanOneDay(currentBusiness.xrayRegistrationData.lastUpdatedISO);

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
    hasBeenMoreThanOneHour(
      currentBusiness.formationData.dbaBusinessNameAvailability.lastUpdatedTimeStamp,
    );

  const businessNameIsOlderThanAnHour =
    currentBusiness.profileData.businessName !== undefined &&
    currentBusiness.formationData.businessNameAvailability !== undefined &&
    hasBeenMoreThanOneHour(
      currentBusiness.formationData.businessNameAvailability.lastUpdatedTimeStamp,
    );

  const isDba = determineIfNexusDbaNameNeeded(currentBusiness);
  const shouldUpdateNameAvailability = isDba
    ? dbaNameIsOlderThanAnHour
    : businessNameIsOlderThanAnHour;

  return shouldUpdateNameAvailability && !currentBusiness.formationData.completedFilingPayment;
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
  databaseClient: DatabaseClient,
  updateLicenseStatus: UpdateLicenseStatus,
  updateXrayStatus: UpdateXrayRegistration,
  updateRoadmapSidebarCards: UpdateSidebarCards,
  updateOperatingPhase: UpdateOperatingPhase,
  encryptionDecryptionClient: CryptoClient,
  hashingClient: CryptoClient,
  timeStampBusinessSearch: TimeStampBusinessSearch,
  logger: LogWriterType,
): Router => {
  const router = Router();
  const encryptFields = encryptFieldsFactory(encryptionDecryptionClient, hashingClient);

  router.post("/users/emailCheck", async (req, res) => {
    const { email } = req.body;
    const requestStart = Date.now();
    const endpoint = req.originalUrl;
    const method = req.method;

    logger.LogInfo(`[START] ${method} ${endpoint} - payload: ${JSON.stringify({ email })}`);

    if (email === undefined) {
      const status = StatusCodes.BAD_REQUEST;
      res.status(status).send({ error: "`email` property required." });
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, duration: ${Date.now() - requestStart}ms`,
      );
      return;
    }
    try {
      const userData = await databaseClient.findByEmail(email.toLowerCase());
      const status = userData ? StatusCodes.OK : StatusCodes.NOT_FOUND;
      res.status(status).send({ email, found: !!userData });
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, email: ${email}, found: ${!!userData}, duration: ${
          Date.now() - requestStart
        }ms`,
      );
    } catch (error: unknown) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      if (error instanceof Error) {
        logger.LogError(`[ERROR] ${method} ${endpoint} - ${error.message}`);
      } else {
        logger.LogError(`[ERROR] ${method} ${endpoint} - Unknown error`);
      }
      res.status(status).send({ error: "Internal server error." });
    }
  });

  router.get("/users/:userId", (req, res) => {
    const signedInUserId = getSignedInUserId(req);
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const requestedUserId = req.params.userId;

    logger.LogInfo(`[START] ${method} ${endpoint} - userId: ${requestedUserId}`);

    if (signedInUserId !== requestedUserId) {
      const status = StatusCodes.FORBIDDEN;
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, reason: signed-in user mismatch, duration: ${
          Date.now() - requestStart
        }ms`,
      );
      res.status(status).json();
      return;
    }

    databaseClient
      .get(requestedUserId)
      .then(async (userData: UserData) => {
        let updatedUserData = userData;
        updatedUserData = await updateBusinessNameSearchIfNeeded(updatedUserData)
          .then((userData) => updateOperatingPhase(userData))
          .then((userData) => updateRoadmapSidebarCards(userData))
          .then((userData) => asyncUpdateLicenseStatus(userData))
          .then((userData) => asyncUpdateXrayStatus(userData));

        await databaseClient.put(updatedUserData);

        const sanitizedUserData = removeSensitiveData(updatedUserData);
        const status = StatusCodes.OK;
        res.status(status).json(sanitizedUserData);

        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, userId: ${requestedUserId}, duration: ${
            Date.now() - requestStart
          }ms`,
        );
      })
      .catch((error: Error) => {
        if (error.message === "Not found") {
          if (process.env.IS_OFFLINE || process.env.STAGE === "dev") {
            logger.LogInfo(
              `${method} ${endpoint} - user not found, creating empty user, userId: ${requestedUserId}`,
            );
            saveEmptyUserData(req, res, signedInUserId);
          } else {
            const status = StatusCodes.NOT_FOUND;
            logger.LogError(
              `${method} ${endpoint} - Resource not found: User ID ${requestedUserId}, status: ${status}`,
            );
            res.status(status).json({ error: error.message });
          }
        } else {
          const status = StatusCodes.INTERNAL_SERVER_ERROR;
          logger.LogError(`${method} ${endpoint} - Unknown error: ${error.message}`);
          res.status(status).json({ error: error.message });
        }
      });
  });

  router.post("/users", async (req, res) => {
    let userData = req.body as UserData;
    const signedInUserId = getSignedInUserId(req);
    const postedUserBodyId = userData.user.id;

    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    logger.LogInfo(`[START] ${method} ${endpoint} - userId: ${postedUserBodyId}`);

    if (signedInUserId !== postedUserBodyId) {
      const status = StatusCodes.FORBIDDEN;
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, reason: signed-in user mismatch, duration: ${
          Date.now() - requestStart
        }ms`,
      );
      res.status(status).json();
      return;
    }

    if (await industryHasChanged(userData)) {
      userData = clearTaskItemChecklists(userData);
    }

    const userDataWithUpdatedLegalStructure = await updateLegalStructureIfNeeded(userData);
    const userDataWithAnnualFilings = getAnnualFilings(userDataWithUpdatedLegalStructure);
    const userDataWithUpdatedOperatingPhase = updateOperatingPhase(userDataWithAnnualFilings);
    const userDataWithUpdatedSidebarCards = updateRoadmapSidebarCards(
      userDataWithUpdatedOperatingPhase,
    );
    const userDataWithEncryptedFields = await encryptFields(userDataWithUpdatedSidebarCards);
    const userDataWithUpdatedISO = setLastUpdatedISO(userDataWithEncryptedFields);

    databaseClient
      .put(userDataWithUpdatedISO)
      .then((result: UserData) => {
        const status = StatusCodes.OK;
        res.status(status).json(result);
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, userId: ${postedUserBodyId}, duration: ${
            Date.now() - requestStart
          }ms`,
        );
      })
      .catch((error: Error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        logger.LogError(
          `${method} ${endpoint} - Unknown error: ${
            error.message
          }, status: ${status}, userId: ${postedUserBodyId}, duration: ${
            Date.now() - requestStart
          }ms`,
        );

        res.status(status).json({ error: error.message });
      });
  });

  const industryHasChanged = async (userData: UserData): Promise<boolean> => {
    try {
      const oldUserData = await databaseClient.get(userData.user.id);
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
      oldUserData = await databaseClient.get(userData.user.id);
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

      const address: FormationAddress = {
        addressLine1: formationFormData.addressLine1,
        addressLine2: formationFormData.addressLine2,
        addressCity: formationFormData.addressCity,
        addressMunicipality: formationFormData.addressMunicipality,
        addressState: formationFormData.addressState,
        addressCountry: formationFormData.addressCountry,
        addressZipCode: formationFormData.addressZipCode,
        addressProvince: formationFormData.addressProvince,
        businessLocationType: formationFormData.businessLocationType,
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
      receiveUpdatesAndReminders: true,
      abExperience: decideABExperience(),
      accountCreationSource: "Test Source",
      contactSharingWithAccountCreationPartner: true,
    });

    databaseClient
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
      const needsDba = determineIfNexusDbaNameNeeded(currentBusiness);
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

  const asyncUpdateXrayStatus = async (userData: UserData): Promise<UserData> => {
    const currentBusiness = getCurrentBusiness(userData);

    try {
      if (
        shouldCheckXrayRegistration(currentBusiness) &&
        currentBusiness.xrayRegistrationData?.facilityDetails
      ) {
        return await updateXrayStatus(
          userData,
          currentBusiness.xrayRegistrationData.facilityDetails,
        );
      }

      return userData;
    } catch {
      const updatedBusiness: Business = {
        ...currentBusiness,
        xrayRegistrationData: {
          ...currentBusiness.xrayRegistrationData,
          lastUpdatedISO: getCurrentDateISOString(),
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

const removeSensitiveData = (userData: UserData): UserData => {
  return {
    ...userData,
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business) => {
          return {
            ...business,
            profileData: {
              ...business.profileData,
              hashedTaxId: undefined,
            },
          };
        })
        .map((currentBusiness) => [currentBusiness.id, currentBusiness]),
    ),
  };
};

const setLastUpdatedISO = (userData: UserData): UserData => {
  const updatedUserData: UserData = { ...userData, lastUpdatedISO: getCurrentDateISOString() };
  return modifyCurrentBusiness(updatedUserData, (business) => ({
    ...business,
    lastUpdatedISO: getCurrentDateISOString(),
  }));
};

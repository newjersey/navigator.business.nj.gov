import {
  TaxClearanceCertificateResponse,
  UnlinkTaxIdResponse,
} from "@businessnjgovnavigator/shared";
import {
  type CryptoClient,
  DatabaseClient,
  HealthCheckMetadata,
  TaxClearanceCertificateClient,
} from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { LookupTaxClearanceCertificateAgenciesById } from "@shared/taxClearanceCertificate";
import { UserData } from "@shared/userData";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

type Config = {
  orgUrl: string;
  userName: string;
  password: string;
};
const sanitizeAxiosError = (error: AxiosError): AxiosError => {
  const sanitizedError = { ...error };
  if (sanitizedError.config) {
    sanitizedError.config = { ...sanitizedError.config };
    delete sanitizedError.config.auth; // Remove the auth object
  }
  if (typeof error.toJSON === "function") {
    sanitizedError.toJSON = error.toJSON.bind(sanitizedError);
  }
  return sanitizedError;
};

// Api returns an error message with extra space, second variable added to account for single space error message
export const TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE = "TaxpayerId  is required.";
export const TAX_ID_MISSING_FIELD = "TaxpayerId is required.";

export const INELIGIBLE_TAX_CLEARANCE_FORM = "Clean Tax Verification Failed.";
export const FAILED_TAX_ID_AND_PIN_VALIDATION =
  "ADABase validation failed. Please verify the data submitted and retry.";
export const MISSING_FIELD =
  "Mandatory Field Missing. TaxpayerId, TaxpayerName, AddressLine1, City, State, Zip, Agency name, Rep Id and RepName are required.";
export const NATURAL_PROGRAM_ERROR = "Error calling Natural Program. Please try again later.";
export const BUSINESS_STATUS_VERIFICATION_ERROR = "Business Status Verification Failed.";

const makeTaxClearanceRequest = async (
  config: Config,
  requestBody: Record<string, unknown>,
): Promise<AxiosResponse> => {
  return axios.post(
    `${config.orgUrl}/TYTR_ACE_App/ProcessCertificate/businessClearance`,
    requestBody,
    {
      auth: {
        username: config.userName,
        password: config.password,
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

export const ApiTaxClearanceCertificateClient = (
  logWriter: LogWriterType,
  config: Config,
): TaxClearanceCertificateClient => {
  const postTaxClearanceCertificate = async (
    userData: UserData,
    cryptoClient: CryptoClient,
    databaseClient: DatabaseClient,
  ): Promise<TaxClearanceCertificateResponse> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Tax Clearance Certificate Client - Id:${logId}`);

    const currTaxClearanceData =
      userData.businesses[userData.currentBusinessId].taxClearanceCertificateData;

    if (
      currTaxClearanceData === undefined ||
      currTaxClearanceData.encryptedTaxId === undefined ||
      currTaxClearanceData.encryptedTaxPin === undefined
    ) {
      const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Unexpected required field(s) undefined: ${JSON.stringify(
        currTaxClearanceData,
      )}`;
      logWriter.LogInfo(errorMessage);
      throw errorMessage;
    }

    let currentHashedTaxId: string | undefined;
    try {
      const userDataFromDb = await databaseClient.get(userData.user.id);
      const currentBusiness = userDataFromDb.businesses[userDataFromDb.currentBusinessId];
      currentHashedTaxId = currentBusiness.profileData.hashedTaxId;
    } catch (error) {
      logWriter.LogInfo(
        `Tax Clearance Certificate Client - Id:${logId} - Failed to retrieve user data: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new Error("Failed to retrieve user data");
    }

    if (!currentHashedTaxId) {
      const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Current hashed tax id is undefined`;
      logWriter.LogError(errorMessage);
      throw errorMessage;
    }

    const matchingBusinesses = await databaseClient.findBusinessesByHashedTaxId(currentHashedTaxId);

    for (const business of matchingBusinesses) {
      if (
        business.id !== userData.currentBusinessId &&
        business.taxClearanceCertificateData?.hasPreviouslyReceivedCertificate
      ) {
        return {
          error: {
            type: "TAX_ID_IN_USE_BY_ANOTHER_BUSINESS_ACCOUNT",
            message: `Business has previously received a tax clearance certificate.`,
          },
        };
      }
    }

    const postBody = {
      repId: userData.user.id,
      repName: userData.user.name,
      taxpayerId: await cryptoClient.decryptValue(currTaxClearanceData.encryptedTaxId),
      taxpayerPin: await cryptoClient.decryptValue(currTaxClearanceData.encryptedTaxPin),
      taxpayerName: currTaxClearanceData?.businessName,
      addressLine1: currTaxClearanceData?.addressLine1,
      addressLine2: currTaxClearanceData?.addressLine2,
      city: currTaxClearanceData?.addressCity,
      state: currTaxClearanceData?.addressState?.shortCode,
      zip: currTaxClearanceData?.addressZipCode,
      agencyName: LookupTaxClearanceCertificateAgenciesById(
        currTaxClearanceData?.requestingAgencyId,
      ).name,
    };

    logWriter.LogInfo(
      `Tax Clearance Certificate Client - Id:${logId} - Request Sent to ${
        config.orgUrl
      }/TYTR_ACE_App/ProcessCertificate/businessClearance data: ${JSON.stringify(postBody)}`,
    );

    return makeTaxClearanceRequest(config, postBody)
      .then((response: AxiosResponse) => {
        // If one of the required keys is not present, the response
        // is likely an object representing an indexed HTML string,
        // which we often get as a result of a firewall.
        if (response.data.certificate === undefined) {
          const htmlString = Object.keys(response.data)
            .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
            .map((key) => response.data[key])
            .join("");

          const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Error: Received HTML response indicating a potential firewall issue. ${htmlString}`;
          logWriter.LogError(errorMessage);
          throw errorMessage;
        }

        logWriter.LogInfo(
          `Tax Clearance Certificate Client - Id:${logId} - Response received: ${JSON.stringify({
            ...response.data,
            certificate: "Successful Response - PDF data omitted",
          })}`,
        );
        if (!Array.isArray(response.data.certificate) || response.data.certificate.length === 0) {
          const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Error: Certificate is empty or not an array ${JSON.stringify(
            response.data.certificate,
          )}`;
          logWriter.LogError(errorMessage);
          throw errorMessage;
        }
        const updatedUserData = modifyCurrentBusiness(userData, (business) => ({
          ...business,
          taxClearanceCertificateData: business.taxClearanceCertificateData && {
            ...business.taxClearanceCertificateData,
            hasPreviouslyReceivedCertificate: true,
            lastUpdatedISO: new Date(Date.now()).toISOString(),
          },
        }));
        return { certificatePdfArray: response.data.certificate, userData: updatedUserData };
      })
      .catch((error: AxiosError) => {
        const sanitizedError = sanitizeAxiosError(error);
        logWriter.LogError(
          `Tax Clearance Certificate Client - Id:${logId} - Error`,
          sanitizedError,
        );
        const { response } = error;
        if (response?.status === StatusCodes.BAD_REQUEST) {
          const errorMessage = response.data as string;
          if (errorMessage === INELIGIBLE_TAX_CLEARANCE_FORM) {
            return {
              error: {
                type: "INELIGIBLE_TAX_CLEARANCE_FORM",
                message: errorMessage,
              },
            };
          }
          if (
            errorMessage === MISSING_FIELD ||
            errorMessage === TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE ||
            errorMessage === TAX_ID_MISSING_FIELD
          ) {
            return {
              error: {
                type: "MISSING_FIELD",
                message: errorMessage,
              },
            };
          }
          if (errorMessage === FAILED_TAX_ID_AND_PIN_VALIDATION) {
            return {
              error: {
                type: "FAILED_TAX_ID_AND_PIN_VALIDATION",
                message: errorMessage,
              },
            };
          }
          if (errorMessage === BUSINESS_STATUS_VERIFICATION_ERROR) {
            return {
              error: {
                type: "BUSINESS_STATUS_VERIFICATION_ERROR",
                message: errorMessage,
              },
            };
          }
          if (errorMessage === NATURAL_PROGRAM_ERROR) {
            return {
              error: {
                type: "NATURAL_PROGRAM_ERROR",
                message: errorMessage,
              },
            };
          }
        }
        logWriter.LogError(
          `Tax Clearance Certificate Client - Id:${logId} - Unexpected Error Response`,
          sanitizedError,
        );
        throw error.response?.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
      });
  };

  /*
  Dev Note: this function is purely for QA and Demo purposes only.
  The button linking to this api call will be hidden in prod environments.
  */
  const unlinkTaxId = async (
    userData: UserData,
    databaseClient: DatabaseClient,
  ): Promise<UnlinkTaxIdResponse> => {
    if (process.env.STAGE === "prod") {
      return {
        success: false,
        error: { message: "This function isn't allowed in prod environment" },
      };
    }

    const logId = logWriter.GetId();
    logWriter.LogInfo(`Tax Clearance Certificate Client - Id:${logId} - Unlink Tax ID`);

    const currTaxClearanceData =
      userData.businesses[userData.currentBusinessId].taxClearanceCertificateData;

    if (
      currTaxClearanceData === undefined ||
      currTaxClearanceData.encryptedTaxId === undefined ||
      currTaxClearanceData.encryptedTaxPin === undefined
    ) {
      const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Unlink Tax ID: Unexpected required field(s) undefined: ${JSON.stringify(
        currTaxClearanceData,
      )}`;
      logWriter.LogInfo(errorMessage);
      return {
        success: false,
        error: { message: errorMessage },
      };
    }

    let currentHashedTaxId: string | undefined;
    try {
      const userDataFromDb = await databaseClient.get(userData.user.id);
      const currentBusiness = userDataFromDb.businesses[userDataFromDb.currentBusinessId];
      currentHashedTaxId = currentBusiness.profileData.hashedTaxId;
    } catch (error) {
      const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Unlink Tax ID: Failed to retrieve user data: ${
        error instanceof Error ? error.message : String(error)
      }`;
      logWriter.LogError(errorMessage);
      return {
        success: false,
        error: { message: errorMessage },
      };
    }

    if (!currentHashedTaxId) {
      const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Unlink Tax ID: Current hashed tax id is undefined`;
      logWriter.LogError(errorMessage);
      return {
        success: false,
        error: { message: errorMessage },
      };
    }

    const matchingBusinesses = await databaseClient.findBusinessesByHashedTaxId(currentHashedTaxId);

    for (const business of matchingBusinesses) {
      if (
        business.userId &&
        business.taxClearanceCertificateData?.hasPreviouslyReceivedCertificate
      ) {
        const userData = await databaseClient.get(business.userId);

        if (!userData) {
          const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Unlink Tax ID: User Data can't be found for User ID ${business.userId}`;
          logWriter.LogError(errorMessage);
          return {
            success: false,
            error: { message: errorMessage },
          };
        }

        try {
          const updatedUserData: UserData = {
            ...userData,
            businesses: {
              ...userData.businesses,
              [business.id]: {
                ...business,
                taxClearanceCertificateData: {
                  ...business.taxClearanceCertificateData,
                  hasPreviouslyReceivedCertificate: false,
                },
              },
            },
          };
          await databaseClient.put(updatedUserData);
        } catch (error) {
          const errorMessage = `Tax Clearance Certificate Client - Id:${logId} - Unlink Tax ID: Failed to update user data: ${
            error instanceof Error ? error.message : String(error)
          }`;
          logWriter.LogError(errorMessage);
          return {
            success: false,
            error: { message: errorMessage },
          };
        }
      }
    }

    return { success: true };
  };

  const health = async (): Promise<HealthCheckMetadata> => {
    const logId = logWriter.GetId();
    const healthCheckBody = {
      taxpayerId: "123456789012",
      taxpayerPin: "1234",
      taxpayerName: "RUBBLE, BARNEY",
      repName: "OOI Health Check",
      addressLine1: "Test Line 1",
      addressLine2: "Test Line 2",
      city: "Test City",
      state: "NJ",
      zip: "01234",
      agencyName: "Sample Agency",
      repId: "OOI-Health-Check",
    };

    return makeTaxClearanceRequest(config, healthCheckBody)
      .then((response) => {
        if (response.data.certificate === undefined) {
          const htmlString = Object.keys(response.data)
            .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
            .map((key) => response.data[key])
            .join("");

          logWriter.LogError(
            `Tax Clearance Certificate Health Check Failed - Id:${logId} - Potential Firewall Error: ${htmlString}`,
          );
          return {
            success: false,
            error: {
              message: ReasonPhrases.BAD_GATEWAY,
              timeout: false,
            },
          } as HealthCheckMetadata;
        }

        return {
          success: true,
          data: {
            message: ReasonPhrases.OK,
          },
        } as HealthCheckMetadata;
      })
      .catch((error: AxiosError) => {
        /*
         * Note: The API will return a 400 if the certificate request is rejected, but it still means
         * requests are successfully reaching the server and those responses will be treated as healthy.
         */
        if (error.status === 400 && error.message === FAILED_TAX_ID_AND_PIN_VALIDATION) {
          return {
            success: true,
            data: {
              message: ReasonPhrases.OK,
            },
          } as HealthCheckMetadata;
        }
        logWriter.LogError(
          `Tax Clearance Certificate Health Check Failed - Id:${logId} - Error:`,
          error,
        );
        if (error.response) {
          return {
            success: false,
            error: {
              serverResponseBody: error.message,
              serverResponseCode: error.response.status,
              message: ReasonPhrases.BAD_GATEWAY,
              timeout: false,
            },
          } as HealthCheckMetadata;
        }
        return {
          success: false,
          error: {
            message: ReasonPhrases.GATEWAY_TIMEOUT,
            timeout: true,
          },
        } as HealthCheckMetadata;
      });
  };

  return { postTaxClearanceCertificate, health, unlinkTaxId };
};

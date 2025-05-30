import { TaxClearanceCertificateResponse } from "@businessnjgovnavigator/shared";
import { type CryptoClient, DatabaseClient, TaxClearanceCertificateClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { LookupTaxClearanceCertificateAgenciesById } from "@shared/taxClearanceCertificate";
import { UserData } from "@shared/userData";
import axios, { AxiosError, AxiosResponse } from "axios";
import { StatusCodes } from "http-status-codes";

type Config = {
  orgUrl: string;
  userName: string;
  password: string;
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

    return axios
      .post(`${config.orgUrl}/TYTR_ACE_App/ProcessCertificate/businessClearance`, postBody, {
        auth: {
          username: config.userName,
          password: config.password,
        },
      })
      .then((response: AxiosResponse) => {
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
        logWriter.LogError(`Tax Clearance Certificate Client - Id:${logId} - Error`, error);
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
          error,
        );
        throw error.response?.status;
      });
  };

  return { postTaxClearanceCertificate };
};

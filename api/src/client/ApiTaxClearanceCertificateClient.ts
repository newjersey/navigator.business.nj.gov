import { TaxClearanceCertificateResponse } from "@businessnjgovnavigator/shared";
import { type EncryptionDecryptionClient, TaxClearanceCertificateClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
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
export const GENERIC_ERROR = "Something went wrong. Try again later.";

export const ApiTaxClearanceCertificateClient = (
  logWriter: LogWriterType,
  config: Config,
): TaxClearanceCertificateClient => {
  const postTaxClearanceCertificate = async (
    userData: UserData,
    encryptionDecryptionClient: EncryptionDecryptionClient,
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

    const postBody = {
      repId: userData.user.id,
      repName: userData.user.name,
      taxpayerId: await encryptionDecryptionClient.decryptValue(
        currTaxClearanceData.encryptedTaxId,
      ),
      taxpayerPin: await encryptionDecryptionClient.decryptValue(
        currTaxClearanceData.encryptedTaxPin,
      ),
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
        return { certificatePdfArray: response.data.certificate };
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
        if (response?.status === StatusCodes.INTERNAL_SERVER_ERROR || !response) {
          return {
            error: {
              type: "GENERIC_ERROR",
              message: GENERIC_ERROR,
            },
          };
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

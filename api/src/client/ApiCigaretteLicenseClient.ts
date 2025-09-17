import { ApiCigaretteLicenseHealth } from "@client/ApiCigaretteLicenseHealth";
import {
  CigaretteLicenseApiConfig,
  makeEmailConfirmationBody,
  makePostBody,
} from "@client/ApiCigaretteLicenseHelpers";
import {
  CigaretteLicenseClient,
  EmailClient,
  HealthCheckMetadata,
  HealthCheckMethod,
} from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import {
  EmailConfirmationResponse,
  GetOrderByTokenResponse,
  PaymentApiError,
  PreparePaymentResponse,
} from "@shared/cigaretteLicense";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { UserData } from "@shared/userData";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const getConfig = async (): Promise<CigaretteLicenseApiConfig> => {
  return {
    baseUrl: await getConfigValue("cigarette_license_base_url"),
    apiKey: await getConfigValue("cigarette_license_api_key"),
    merchantCode: await getConfigValue("cigarette_license_merchant_code"),
    merchantKey: await getConfigValue("cigarette_license_merchant_key"),
    serviceCode: await getConfigValue("cigarette_license_service_code"),
  };
};

export const ApiCigaretteLicenseClient = (
  emailClient: EmailClient,
  logger: LogWriterType,
): CigaretteLicenseClient => {
  const preparePayment = async (
    userData: UserData,
    returnUrl: string,
  ): Promise<PreparePaymentResponse> => {
    const config = await getConfig();
    const logId = logger.GetId();
    const postBody = makePostBody(userData, returnUrl, config);

    logger.LogInfo(
      `Cigarette License Client - Id:${logId} - Sending request to ${
        config.baseUrl
      }/tokens data: ${JSON.stringify(postBody)}`,
    );

    return axios
      .post(`${config.baseUrl}/tokens`, postBody, {
        headers: {
          "Content-Type": "application/json",
          ApiKey: config.apiKey,
        },
      })
      .then((response: AxiosResponse) => {
        logger.LogInfo(
          `Cigarette License Client - Id:${logId} - Response received: ${JSON.stringify(
            response.data,
          )}`,
        );
        const successResponse = response.data as PreparePaymentResponse;
        return successResponse;
      })
      .catch((error: AxiosError) => {
        logger.LogError(
          `Cigarette License Client - Id:${logId} - Unknown error received: ${JSON.stringify(
            error,
          )}`,
        );
        const errorResponse: PaymentApiError = {
          statusCode: 500,
          errorCode: "139",
          userMessage: "An unknown error occured",
          developerMessage: JSON.stringify(error),
        };

        return {
          token: "",
          errorResult: errorResponse,
        };
      });
  };

  const getOrderByToken = async (token: string): Promise<GetOrderByTokenResponse> => {
    const config = await getConfig();
    const logId = logger.GetId();

    logger.LogInfo(
      `Cigarette License Client - Id:${logId} - Sending request to ${config.baseUrl}/tokens/${token}}`,
    );

    return axios
      .get(`${config.baseUrl}/tokens/${token}`, {
        headers: {
          "Content-Type": "application/json",
          ApiKey: config.apiKey,
          MerchantCode: config.merchantCode,
          MerchantKey: config.merchantKey,
        },
      })
      .then((response: AxiosResponse) => {
        logger.LogInfo(
          `Cigarette License Client - Id:${logId} - Response received: ${JSON.stringify(
            response.data,
          )}`,
        );
        const successResponse = response.data as GetOrderByTokenResponse;
        return successResponse;
      })
      .catch((error: AxiosError) => {
        logger.LogError(
          `Cigarette License Client - Id:${logId} - Unknown error received: ${JSON.stringify(
            error,
          )}`,
        );
        const errorResponse: PaymentApiError = {
          statusCode: 500,
          errorCode: "139",
          userMessage: "An unknown error occured",
          developerMessage: JSON.stringify(error),
        };

        return {
          matchingOrders: 0,
          errorResult: errorResponse,
        };
      });
  };

  const sendEmailConfirmation = async (
    userData: UserData,
    decryptedTaxId: string,
  ): Promise<EmailConfirmationResponse> => {
    const logId = logger.GetId();
    const currentBusiness = getCurrentBusiness(userData);
    const cigaretteLicenseData = currentBusiness.cigaretteLicenseData;
    const legalStructureId = currentBusiness.profileData.legalStructureId || "";

    if (!cigaretteLicenseData) {
      const errorMessage = `Cigarette License Client - Id:${logId} - cigarette license data is not defined`;
      logger.LogError(errorMessage);
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        message: `The cigaretteLicenseData is not defined for user ${userData.user.id}`,
      };
    }

    if (cigaretteLicenseData.paymentInfo?.confirmationEmailsent) {
      const errorMessage = `Cigarette License Client - Id:${logId} - the email confimation has already been sent for this user`;
      logger.LogError(errorMessage);
      return {
        statusCode: StatusCodes.CONFLICT,
        message: `The cigarette license confirmation email has already been sent for for user ${userData.user.id}`,
      };
    }

    const postBody = await makeEmailConfirmationBody(
      cigaretteLicenseData,
      legalStructureId,
      decryptedTaxId,
    );

    return await emailClient.sendEmail(postBody);
  };

  const health: HealthCheckMethod = async (): Promise<HealthCheckMetadata> => {
    const config = await getConfig();
    const userData = ApiCigaretteLicenseHealth;
    const postBody = makePostBody(userData, "returnUrl", config);
    const logId = logger.GetId();
    logger.LogInfo(
      `Cigarette License Health Check - NICUSA - Id:${logId} - Request Sent to ${
        config.baseUrl
      }/tokens data: ${JSON.stringify(postBody)}`,
    );

    return axios
      .post(`${config.baseUrl}/tokens`, postBody, {
        headers: {
          "Content-Type": "application/json",
          ApiKey: config.apiKey,
        },
      })
      .then((response: AxiosResponse) => {
        logger.LogInfo(
          `Cigarette License Health Check - NICUSA - Id:${logId} - Response received: ${JSON.stringify(
            response.data,
          )}`,
        );
        const res = response.data as PreparePaymentResponse;
        return res.token && !res.errorResult
          ? ({
              success: true,
              data: {
                message: ReasonPhrases.OK,
              },
            } as HealthCheckMetadata)
          : ({
              success: false,
              error: {
                message: ReasonPhrases.NOT_ACCEPTABLE,
                timeout: false,
              },
            } as HealthCheckMetadata);
      })
      .catch((error: AxiosError) => {
        logger.LogError(`API Cigarette License Health Check Failed - Id:${logId} - Error:`, error);
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

  return { preparePayment, getOrderByToken, sendEmailConfirmation, health };
};

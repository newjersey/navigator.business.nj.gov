import { CigaretteLicenseClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import {
  CigaretteLicenseApiConfig,
  CigaretteLicensePaymentApiError,
  CigaretteLicenseGetOrderByTokenResponse,
  CigaretteLicensePreparePaymentResponse,
  makePostBody,
} from "@client/ApiCigaretteLicenseHelpers";
import { ApiCigaretteLicenseHealth } from "@client/ApiCigaretteLicenseHealth";
import { HealthCheckMethod, HealthCheckMetadata } from "@domain/types";
import { UserData } from "@shared/userData";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ReasonPhrases } from "http-status-codes";

export const ApiCigaretteLicenseClient = (
  logger: LogWriterType,
  config: CigaretteLicenseApiConfig,
): CigaretteLicenseClient => {
  const preparePayment = async (
    userData: UserData,
    returnUrl: string,
  ): Promise<CigaretteLicensePreparePaymentResponse> => {
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
        const successResponse = response.data as CigaretteLicensePreparePaymentResponse;
        return successResponse;
      })
      .catch((error: AxiosError) => {
        logger.LogError(
          `Cigarette License Client - Id:${logId} - Unknown error received: ${JSON.stringify(
            error,
          )}`,
        );
        const errorResponse: CigaretteLicensePaymentApiError = {
          statusCode: 500,
          errorCode: 500,
          userMessage: "An unknown error occured",
          developerMessage: JSON.stringify(error),
        };

        return {
          token: "",
          errorResult: errorResponse,
        };
      });
  };

  const getOrderByToken = async (
    token: string,
  ): Promise<CigaretteLicenseGetOrderByTokenResponse> => {
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
        const successResponse = response.data as CigaretteLicenseGetOrderByTokenResponse;
        return successResponse;
      })
      .catch((error: AxiosError) => {
        logger.LogError(
          `Cigarette License Client - Id:${logId} - Unknown error received: ${JSON.stringify(
            error,
          )}`,
        );
        const errorResponse: CigaretteLicensePaymentApiError = {
          statusCode: 500,
          errorCode: 500,
          userMessage: "An unknown error occured",
          developerMessage: JSON.stringify(error),
        };

        return {
          matchingOrders: 0,
          errorResult: errorResponse,
        };
      });
  };

  const health: HealthCheckMethod = async (): Promise<HealthCheckMetadata> => {
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
        const res = response.data as CigaretteLicensePreparePaymentResponse;
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

  return { preparePayment, getOrderByToken, health };
};

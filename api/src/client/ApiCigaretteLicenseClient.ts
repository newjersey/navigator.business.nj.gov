import { CigaretteLicenseClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import {
  CigaretteLicenseApiConfig,
  CigaretteLicensePaymentApiError,
  CigaretteLicenseGetOrderByTokenResponse,
  CigaretteLicensePreparePaymentResponse,
  makePostBody,
} from "@client/ApiCigaretteLicenseHelpers";
import { UserData } from "@shared/userData";
import axios, { AxiosResponse } from "axios";

export const ApiCigaretteLicenseClient = (
  logger: LogWriterType,
  config: CigaretteLicenseApiConfig,
): CigaretteLicenseClient => {
  const preparePayment = async (
    userData: UserData,
  ): Promise<CigaretteLicensePreparePaymentResponse> => {
    const logId = logger.GetId();
    const postBody = makePostBody(userData, config);

    logger.LogInfo(
      `Cigarette License Client - Id:${logId} - Request Sent to ${
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
      .catch((error) => {
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
          error: errorResponse,
        };
      });
  };

  const getOrderByToken = async (
    token: string,
  ): Promise<CigaretteLicenseGetOrderByTokenResponse> => {
    const logId = logger.GetId();

    logger.LogInfo(
      `Cigarette License Client - Id:${logId} - Request Sent to ${config.baseUrl}/tokens/${token}}`,
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
      .catch((error) => {
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
          error: errorResponse,
        };
      });
  };

  return { preparePayment, getOrderByToken };
};

import { FormationClient, HealthCheckMetadata, HealthCheckMethod } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import {
  FormationSubmitError,
  FormationSubmitResponse,
  GetFilingResponse,
  InputFile,
} from "@shared/formationData";
import { UserData } from "@shared/userData";
import axios, { AxiosError } from "axios";

import { ApiFormationHealth } from "@client/ApiFormationHealth";
import {
  ApiConfig,
  ApiErrorResponse,
  ApiGetFilingResponse,
  ApiResponse,
  makePostBody,
} from "@client/ApiFormationHelpers";
import { splitErrorField } from "@client/splitErrorField";
import { ReasonPhrases } from "http-status-codes";

export const ApiFormationClient = (config: ApiConfig, logger: LogWriterType): FormationClient => {
  const logId = logger.GetId();
  const form = (
    userData: UserData,
    returnUrl: string,
    foreignGoodStandingFile: InputFile | undefined
  ): Promise<FormationSubmitResponse> => {
    const postBody = makePostBody(userData, returnUrl, config, foreignGoodStandingFile);
    const postContentType = "text/plain";

    logger.LogInfo(
      `Formation - NICUSA - Id:${logId} - ${postContentType} Request Sent to ${
        config.baseUrl
      }/PrepareFiling data: ${JSON.stringify(postBody)}`
    );

    return axios
      .post(`${config.baseUrl}/PrepareFiling`, postBody, {
        headers: {
          "Content-Type": postContentType,
        },
      })
      .then((response) => {
        logger.LogInfo(
          `Formation - NICUSA - Id:${logId} - Response received: ${JSON.stringify(response.data)}`
        );
        if (response.data.Success && response.data.Success === true) {
          const successResponse = response.data as ApiResponse;
          return {
            success: true,
            token: successResponse.PayUrl.PortalPayId,
            formationId: successResponse.Id,
            redirect: successResponse.PayUrl.RedirectToUrl,
            errors: [],
            lastUpdatedISO: getCurrentDateISOString(),
          };
        } else {
          let errors = [] as FormationSubmitError[];
          logger.LogInfo(
            `Formation - NICUSA - Id:${logId} - Response error received: ${JSON.stringify(response.data)}`
          );
          if (Array.isArray(response.data)) {
            const apiError = response.data as ApiErrorResponse;
            errors = apiError.map((error) => {
              return {
                field: splitErrorField(error.Name),
                message: error.ErrorMessage,
                type: "FIELD",
              };
            });
          } else {
            errors = [{ field: "", message: "Response Error", type: "RESPONSE" }];
          }
          return {
            success: false,
            formationId: undefined,
            token: undefined,
            redirect: undefined,
            lastUpdatedISO: getCurrentDateISOString(),
            errors,
          };
        }
      })
      .catch((error) => {
        logger.LogError(
          `Formation - NICUSA - Id:${logId} - Unknown error received: ${JSON.stringify(error)}`
        );
        return {
          success: false,
          token: undefined,
          formationId: undefined,
          redirect: undefined,
          errors: [{ field: "", message: "Unknown Error", type: "UNKNOWN" }],
          lastUpdatedISO: getCurrentDateISOString(),
        };
      });
  };

  const getCompletedFiling = (formationId: string): Promise<GetFilingResponse> => {
    const postBody = {
      Account: config.account,
      Key: config.key,
      FormationId: formationId,
    };
    logger.LogInfo(
      `GetFiling - NICUSA - Id:${logId} - Request Sent to ${
        config.baseUrl
      }/GetCompletedFiling data: ${JSON.stringify(postBody)}`
    );
    return axios
      .post(`${config.baseUrl}/GetCompletedFiling`, postBody)
      .then((response) => {
        logger.LogInfo(
          `GetFiling - NICUSA - Id:${logId} - Response received: ${JSON.stringify(response.data)}`
        );
        if (response.data.Success && response.data.Success === true) {
          const successResponse = response.data as ApiGetFilingResponse;
          return {
            success: successResponse.Success,
            entityId: successResponse.EntityId,
            transactionDate: successResponse.TransactionDate,
            confirmationNumber: successResponse.ConfirmationNumber,
            formationDoc: successResponse.FormationDoc,
            standingDoc: successResponse.StandingDoc,
            certifiedDoc: successResponse.CertifiedDoc,
          };
        } else {
          return {
            success: false,
            entityId: "",
            transactionDate: "",
            confirmationNumber: "",
            formationDoc: "",
            standingDoc: "",
            certifiedDoc: "",
          };
        }
      })
      .catch((error) => {
        logger.LogError(
          `GetFiling - NICUSA - Id:${logId} - Unknown error received: ${JSON.stringify(error)}`
        );
        return {
          success: false,
          entityId: "",
          transactionDate: "",
          confirmationNumber: "",
          formationDoc: "",
          standingDoc: "",
          certifiedDoc: "",
        };
      });
  };

  const health: HealthCheckMethod = () => {
    const userData = ApiFormationHealth;
    const returnUrl: string = "returnUrl";
    const foreignGoodStandingFile = undefined;

    const postBody = makePostBody(userData, returnUrl, config, foreignGoodStandingFile);
    const logId = logger.GetId();
    logger.LogInfo(
      `Formation Health Check - NICUSA - Id:${logId} - Request Sent to ${
        config.baseUrl
      }/PrepareFiling data: ${JSON.stringify(postBody)}`
    );

    return axios
      .post(`${config.baseUrl}/PrepareFiling`, postBody, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
      .then((response) => {
        logger.LogInfo(
          `Formation Health Check - NICUSA - Id:${logId} - Response received: ${JSON.stringify(
            response.data
          )}`
        );
        return response.data.Success && response.data.Success === true
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
        logger.LogError(`API Formation Health Check Failed - Id:${logId} - Error:`, error);
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

  return {
    form,
    getCompletedFiling,
    health,
  };
};

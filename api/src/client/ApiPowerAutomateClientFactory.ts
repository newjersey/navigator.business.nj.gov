import { HealthCheckMetadata, PowerAutomateClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosResponse } from "axios";
import { ReasonPhrases } from "http-status-codes";

interface Config {
  baseUrl: string;
  apiKey: string;
  logger: LogWriterType;
}

export const ApiPowerAutomateClientFactory = (config: Config): PowerAutomateClient => {
  const logId = config.logger.GetId();

  const startWorkflow = async (props: {
    body?: object;
    headers?: object;
  }): Promise<AxiosResponse> => {
    return axios
      .post(
        config.baseUrl,
        { ...props.body, "api-key": config.apiKey },
        {
          headers: {
            ...props.headers,
            "Content-Type": "application/json",
          },
        },
      )
      .then((response: AxiosResponse) => {
        config.logger.LogInfo(
          `Power Automate Client - Id:${logId} - Response received: ${JSON.stringify(response.data)}`,
        );
        return response;
      })
      .catch((error) => {
        config.logger.LogError(
          `Power Automate Client - Id:${logId} - Error received: ${JSON.stringify(error)}`,
        );
        throw error;
      });
  };

  const health = async (): Promise<HealthCheckMetadata> => {
    return startWorkflow({ headers: { "health-check": "active" } })
      .then((response) => {
        config.logger.LogInfo(
          `Power Automate Health Check - Id:${logId} - Response received: ${JSON.stringify(
            response.data,
          )}`,
        );
        return {
          success: true,
          data: {
            message: ReasonPhrases.OK,
          },
        };
      })
      .catch((error) => {
        config.logger.LogError(
          `Power Automate Health Check - Id:${logId} - Error received: ${JSON.stringify(error)}`,
        );
        return {
          success: false,
          data: {
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          },
        };
      });
  };

  return {
    startWorkflow,
    health,
  };
};

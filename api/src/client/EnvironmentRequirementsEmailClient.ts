import {
  EmailConfirmationResponse,
  EmailConfirmationSubmission,
} from "@businessnjgovnavigator/shared";
import { ApiPowerAutomateClientFactory } from "@client/ApiPowerAutomateClientFactory";
import { HealthCheckMetadata, PowerAutomateEmailClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const getConfig = async (): Promise<{
  emailUrl: string;
  emailKey: string;
}> => {
  return {
    emailUrl: await getConfigValue("environment_requirements_email_url"),
    emailKey: await getConfigValue("environment_requirements_email_key"),
  };
};

export const EnvironmentRequirementsEmailClient = (
  logger: LogWriterType,
): PowerAutomateEmailClient => {
  const logId = logger.GetId();

  const sendEmail = async (
    postBody: EmailConfirmationSubmission,
  ): Promise<EmailConfirmationResponse> => {
    const config = await getConfig();

    const environmentRequirementsPowerAutomateClient = ApiPowerAutomateClientFactory({
      baseUrl: config.emailUrl,
      apiKey: config.emailKey,
      logger,
    });

    logger.LogInfo(
      `Env Req Email Client - Id:${logId} - Sending request to ${
        config.emailUrl
      } data: ${JSON.stringify(postBody)}`,
    );
    return environmentRequirementsPowerAutomateClient
      .startWorkflow({ body: postBody })
      .then((response) => {
        logger.LogInfo(
          `Env Req Email Client - Id:${logId} - Response received: ${JSON.stringify(response.data)}`,
        );

        const successResponse: EmailConfirmationResponse = {
          statusCode: response.status,
          message: response.data.message,
        };
        return successResponse;
      })
      .catch((error) => {
        logger.LogError(
          `Env Req Email Client - Id:${logId} - Error received: ${JSON.stringify(error)}`,
        );
        const errorResponse: EmailConfirmationResponse = {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: error.message,
        };

        return errorResponse;
      });
  };

  const health = async (): Promise<HealthCheckMetadata> => {
    const config = await getConfig();
    const environmentRequirementsPowerAutomateClient = ApiPowerAutomateClientFactory({
      baseUrl: config.emailUrl,
      apiKey: config.emailKey,
      logger,
    });

    return environmentRequirementsPowerAutomateClient
      .health()
      .then(() => {
        logger.LogInfo(`Env Req Email Health Check - Id:${logId} - Successful response received.`);
        return {
          success: true,
          data: {
            message: ReasonPhrases.OK,
          },
        };
      })
      .catch(() => {
        logger.LogError(`Env Req Email Health Check - Id:${logId} - Error received.`);
        return {
          success: false,
          data: {
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          },
        };
      });
  };

  return {
    sendEmail,
    health,
  };
};

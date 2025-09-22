import {
  EmailConfirmationResponse,
  EmailConfirmationSubmission,
} from "@businessnjgovnavigator/shared";
import { ApiPowerAutomateClientFactory } from "@client/ApiPowerAutomateClientFactory";
import { EmailClient, HealthCheckMetadata } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const getConfig = async (): Promise<{
  emailConfirmationUrl: string;
  emailConfirmationKey: string;
}> => {
  return {
    emailConfirmationUrl: await getConfigValue("cigarette_license_email_confirmation_url"),
    emailConfirmationKey: await getConfigValue("cigarette_license_email_confirmation_key"),
  };
};

export const CigaretteLicenseEmailClient = (logger: LogWriterType): EmailClient => {
  const logId = logger.GetId();

  const sendEmail = async (
    postBody: EmailConfirmationSubmission,
  ): Promise<EmailConfirmationResponse> => {
    const config = await getConfig();

    const cigarettePowerAutomateClient = ApiPowerAutomateClientFactory({
      baseUrl: config.emailConfirmationUrl,
      apiKey: config.emailConfirmationKey,
      logger,
    });

    logger.LogInfo(
      `Cigarette License Email Client - Id:${logId} - Sending request to ${
        config.emailConfirmationUrl
      } data: ${JSON.stringify(postBody)}`,
    );
    return cigarettePowerAutomateClient
      .startWorkflow({ body: postBody })
      .then((response) => {
        logger.LogInfo(
          `Cigarette License Client - Id:${logId} - Response received: ${JSON.stringify(
            response.data,
          )}`,
        );

        const successResponse: EmailConfirmationResponse = {
          statusCode: response.status,
          message: response.data.message,
        };
        return successResponse;
      })
      .catch((error) => {
        logger.LogError(
          `Cigarette License Email Client - Id:${logId} - Error received: ${JSON.stringify(error)}`,
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
    const cigarettePowerAutomateClient = ApiPowerAutomateClientFactory({
      baseUrl: config.emailConfirmationUrl,
      apiKey: config.emailConfirmationKey,
      logger,
    });

    return cigarettePowerAutomateClient
      .health()
      .then(() => {
        logger.LogInfo(
          `Cigarette License Email Health Check - Id:${logId} - Successful response received.`,
        );
        return {
          success: true,
          data: {
            message: ReasonPhrases.OK,
          },
        };
      })
      .catch(() => {
        logger.LogError(`Cigarette License Email Health Check - Id:${logId} - Error received.`);
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

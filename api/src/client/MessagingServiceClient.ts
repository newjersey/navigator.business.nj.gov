import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { HealthCheckMetadata, MessagingServiceClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { ReasonPhrases } from "http-status-codes";

export const createMessagingServiceClient = (config: {
  functionName: string;
  logWriter: LogWriterType;
}): MessagingServiceClient => {
  const logId = config.logWriter.GetId();
  const lambdaClient = new LambdaClient({});

  const sendEmail = async (
    toEmailAddress: string,
    options?: { templateId?: string; templateData?: Record<string, string> },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const payload = {
      action: "sendEmail",
      toEmail: toEmailAddress,
      data: {
        name: options?.templateData?.name || "",
      },
      ...(options?.templateId && { templateId: options.templateId }),
    };

    config.logWriter.LogInfo(
      `MessagingServiceClient - Id:${logId} - Request Sent. function: ${config.functionName}. toEmail: ${toEmailAddress}`,
    );

    try {
      const command = new InvokeCommand({
        FunctionName: config.functionName,
        InvocationType: "RequestResponse",
        Payload: Buffer.from(JSON.stringify(payload)),
      });

      const response = await lambdaClient.send(command);
      const responsePayload = JSON.parse(
        Buffer.from(response.Payload || new Uint8Array()).toString(),
      );

      config.logWriter.LogInfo(
        `MessagingServiceClient - Id:${logId} Response Received. StatusCode: ${response.StatusCode}. Data: ${JSON.stringify(responsePayload)}`,
      );

      if (response.FunctionError) {
        throw new Error(responsePayload.errorMessage || "Unknown Lambda error");
      }

      return {
        success: true,
        messageId: responsePayload.messageId,
      };
    } catch (error: unknown) {
      config.logWriter.LogError(
        `MessagingServiceClient - Id:${logId} - Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const health = async (): Promise<HealthCheckMetadata> => {
    try {
      const command = new InvokeCommand({
        FunctionName: config.functionName,
        InvocationType: "RequestResponse",
        Payload: Buffer.from(JSON.stringify({ action: "health" })),
      });

      const response = await lambdaClient.send(command);

      if (response.FunctionError) {
        const responsePayload = JSON.parse(
          Buffer.from(response.Payload || new Uint8Array()).toString(),
        );
        return {
          success: false,
          error: {
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            serverResponseBody: responsePayload.errorMessage || "Unknown Lambda error",
          },
        } as HealthCheckMetadata;
      }

      return {
        success: true,
        data: {
          message: ReasonPhrases.OK,
        },
      } as HealthCheckMetadata;
    } catch (error: unknown) {
      config.logWriter.LogError(
        `MessagingServiceClient Health - Id:${logId} - Error: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        success: false,
        error: {
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          serverResponseBody: error instanceof Error ? error.message : String(error),
        },
      } as HealthCheckMetadata;
    }
  };

  return {
    sendEmail,
    health,
  };
};

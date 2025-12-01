import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { HealthCheckMetadata, MessagingServiceClient } from "@domain/types";
import { STAGE } from "@functions/config";
import { LogWriterType } from "@libs/logWriter";
import { ReasonPhrases } from "http-status-codes";

export const AwsMessagingServiceClient = (config: {
  logWriter: LogWriterType;
}): MessagingServiceClient => {
  const isLocal = STAGE === "local";

  const logId = config.logWriter.GetId();
  const lambdaClient = new LambdaClient({});
  const functionName = isLocal ? "sendEmailTest" : `messaging-service-${STAGE}`;

  const sendMessage = async (
    userId: string,
    messageType: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const payload = {
      action: "sendMessage",
      userId,
      messageType,
    };

    config.logWriter.LogInfo(
      `MessagingServiceClient - Id:${logId} - Request Sent. function: ${functionName}. userId: ${userId}, messageType: ${messageType}`,
    );

    try {
      const command = new InvokeCommand({
        FunctionName: functionName,
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
        FunctionName: functionName,
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
    sendMessage,
    health,
  };
};

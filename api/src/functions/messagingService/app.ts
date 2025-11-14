import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoMessagesDataClient } from "@db/DynamoMessagesDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { type MessageChannel, type MessageTemplateId, type MessageTopic } from "@domain/types";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  IS_OFFLINE,
  STAGE,
} from "@functions/config";
import { LogWriter } from "@libs/logWriter";
import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

export interface SimpleSendRequest {
  toEmail: string;
  userId: string;
}

const AWSTaxIDEncryptionClient = AWSCryptoFactory(AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY, {
  stage: AWS_CRYPTO_CONTEXT_STAGE,
  purpose: AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  origin: AWS_CRYPTO_CONTEXT_ORIGIN,
});

export const handler = async (event: SimpleSendRequest) => {
  const logger = LogWriter(`HealthCheckService/${STAGE}`, "ApiLogs");
  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const messageDataClient = DynamoMessagesDataClient(dynamoDb, "messages-table ? ", logger);
  const userDataClient = DynamoUserDataClient(
    dynamoDb,
    AWSTaxIDEncryptionClient,
    "messages-table ? ",
    logger,
  );

  const userData = await userDataClient.get(event.userId);
  const userName = userData.user.name || "Business Owner";
  const businessName =
    userData.businesses[userData.currentBusinessId].profileData.businessName || "your business";

  const htmlTemplate = fs.readFileSync(path.join(__dirname, "templates", "welcome.html"), "utf8");

  const htmlBody = htmlTemplate
    .replaceAll("{{userName}}", userName)
    .replaceAll("{{businessName}}", businessName);

  const sesClient = new SESClient({});
  const input = {
    Source: "no-reply@business.nj.gov",
    Destination: {
      ToAddresses: [event.toEmail],
      CcAddresses: [],
      BccAddresses: [],
    },
    Message: {
      Subject: {
        Data: "Welcome to Business.NJ.gov",
        Charset: "utf8",
      },
      Body: {
        Text: {
          Data: "Welcome to Business.NJ.gov",
          Charset: "utf8",
        },
        Html: {
          Data: htmlBody,
          Charset: "utf8",
        },
      },
    },
    ReplyToAddresses: ["help@business.nj.gov"],
    // ReturnPath: "STRING_VALUE",
    // SourceArn: "STRING_VALUE",
    // ReturnPathArn: "STRING_VALUE",
    Tags: [
      {
        Name: "type",
        Value: "welcome-email",
      },
    ],
    // ConfigurationSetName: "STRING_VALUE",
  };

  logger.LogInfo(`Sending email to ${event.toEmail}`);
  const command = new SendEmailCommand(input);
  const messageTaskId = uuidv4();
  const message = {
    taskId: messageTaskId,
    userId: event.userId,
    channel: "email" as MessageChannel,
    templateId: "welcome@v1" as MessageTemplateId,
    topic: "welcome" as MessageTopic,
    templateData: {
      name: userName || "",
      business: businessName,
    },
    dueAt: new Date().toISOString(),
    deliveredAt: new Date().toISOString(),
    dateCreated: new Date().toISOString(),
  };
  try {
    const response = await sesClient.send(command);
    messageDataClient.put(message);
    return response;
  } catch (error) {
    logger.LogError(`Error sending message ${messageTaskId} to ${event.toEmail}: ${error}`);
  } finally {
    logger.LogInfo(
      `Successfully sent email to ${event.toEmail} and logged message ${messageTaskId}`,
    );
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(message),
  };
  return response;
};

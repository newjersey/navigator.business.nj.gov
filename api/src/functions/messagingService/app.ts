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
  MESSAGES_TABLE,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
import { LogWriter } from "@libs/logWriter";
import { v4 as uuidv4 } from "uuid";
import { WelcomeEmailB} from "@businessnjgovnavigator/react-email/emails/welcomeEmailB"
// ^ Getting VSCode error "but '--jsx' is not set", not sure what is happening there.
// I created a tsconfig.json and set jsx, but that didn't seem to do it.
// i also edited api/tsconfig.paths.json but that might not have done anything
import { render, pretty } from '@react-email/render';


const welcomeHtmlTemplate = await pretty(await render(<WelcomeEmailB />));
export interface SimpleSendRequest {
  userId: string;
  action: string;
  messageType: string;
}

const AWSTaxIDEncryptionClient = AWSCryptoFactory(AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY, {
  stage: AWS_CRYPTO_CONTEXT_STAGE,
  purpose: AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  origin: AWS_CRYPTO_CONTEXT_ORIGIN,
});

export const handler = async (
  event: SimpleSendRequest,
): Promise<{ statusCode: number; messageId: string; body: string }> => {
  const logger = LogWriter(`HealthCheckService/${STAGE}`, "ApiLogs");
  const dynamoDb = createDynamoDbClient(IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const messageDataClient = DynamoMessagesDataClient(dynamoDb, MESSAGES_TABLE, logger);
  const userDataClient = DynamoUserDataClient(
    dynamoDb,
    AWSTaxIDEncryptionClient,
    USERS_TABLE,
    logger,
  );

  const userData = await userDataClient.get(event.userId);
  const userName = userData.user.name || "Business Owner";
  const businessName =
    userData.businesses[userData.currentBusinessId].profileData.businessName || "your business";
  const toEmail = userData.user.email;

  const htmlBody = welcomeHtmlTemplate
    .replaceAll("{{userName}}", userName)
    .replaceAll("{{businessName}}", businessName);

  const sesClient = new SESClient({});
  const input = {
    Source: "no-reply@business.nj.gov",
    Destination: {
      ToAddresses: [toEmail],
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
    ReturnPath: "help@business.nj.gov",
    Tags: [
      {
        Name: "type",
        Value: "welcome-email",
      },
    ],
  };

  logger.LogInfo(`Sending email to ${toEmail}`);
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
    const sendEmailOutput = await sesClient.send(command);
    logger.LogInfo(`Successfully sent email to ${toEmail}, ${JSON.stringify(sendEmailOutput)}`);
    await messageDataClient.put(message);
    logger.LogInfo(`Successfully logged message ${messageTaskId}`);
  } catch (error) {
    logger.LogError(`Error sending or logging message ${messageTaskId} to ${toEmail}: ${error}`);
  }

  return {
    statusCode: 200,
    messageId: messageTaskId,
    body: JSON.stringify(message),
  };
};

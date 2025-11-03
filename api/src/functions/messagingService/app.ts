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

const welcomeHtmlTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Business.NJ.gov</title>
  </head>
  <body
    style="
      font-family:
        &quot;Public Sans Web&quot;,
        -apple-system,
        BlinkMacSystemFont,
        &quot;Segoe UI&quot;,
        Roboto,
        Helvetica,
        Arial,
        sans-serif;
      line-height: 160%;
      color: #1b1b1b;
      background-color: #f8f8f8;
      margin: 0;
      padding: 1.5rem;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 2rem;
        border-radius: 0.5rem;
      "
    >
      <h1
        style="
          color: #4b7600;
          font-size: 2rem;
          font-weight: 700;
          line-height: 120%;
          margin: 0 0 1rem 0;
        "
      >
        Welcome {{userName}}!
      </h1>
      <p style="margin: 0 0 1rem 0">
        Thank you for registering <strong>{{businessName}}</strong> with Business.NJ.gov Navigator.
      </p>
      <p style="margin: 0 0 1rem 0">
        We're here to help guide you through starting and running your business in New Jersey.
      </p>
      <p style="margin: 0">
        Best regards,<br />
        <strong>The Business.NJ.gov Team</strong>
      </p>
    </div>
    <div
      style="
        max-width: 600px;
        margin: 1rem auto 0;
        text-align: center;
        font-size: 0.875rem;
        color: #5c5c5c;
      "
    >
      <p style="margin: 0">State of New Jersey | Business.NJ.gov</p>
    </div>
  </body>
</html>`;

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

import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoMessagesDataClient } from "@db/DynamoMessagesDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import {
  MessageData,
  type MessageChannel,
  type MessageTemplateId,
  type MessageTopic,
} from "@domain/types";
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
// eslint-disable-next-line no-restricted-imports
import welcomeHtmlTemplate from "./emails/welcomeEmail.html";

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
  // TODO: Need a new log stream for the messaging service
  const logger = LogWriter(`NavigatorWebService/${STAGE}`, "ApiLogs");
  const sesClient = new SESClient({});
  const dynamoDb = createDynamoDbClient(IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const messageDataClient = DynamoMessagesDataClient(dynamoDb, MESSAGES_TABLE, logger);
  const userDataClient = DynamoUserDataClient(
    dynamoDb,
    AWSTaxIDEncryptionClient,
    USERS_TABLE,
    logger,
  );

  const userData = await userDataClient.get(event.userId);

  const toEmail = userData.user.email;
  const command = buildWelcomeEmail({ toEmail });
  const message = buildMessageRecord({
    userId: userData.user.id,
    channel: "email",
    templateId: "welcome_version-B",
    topic: "welcome",
    templateData: { name: userData.user.name || "" },
  });

  try {
    logger.LogInfo(`Sending email to ${toEmail}`);
    const sendEmailOutput = await sesClient.send(command);
    logger.LogInfo(`Successfully sent email to ${toEmail}, ${JSON.stringify(sendEmailOutput)}`);
    await messageDataClient.put(message);
    logger.LogInfo(`Successfully logged message ${message.taskId}`);
  } catch (error) {
    logger.LogError(`Error sending or logging message ${message.taskId} to ${toEmail}: ${error}`);
  }

  return {
    statusCode: 200,
    messageId: message.taskId,
    body: JSON.stringify(message),
  };
};

const buildWelcomeEmail = (props: { toEmail: string }): SendEmailCommand => {
  const htmlBody = welcomeHtmlTemplate;
  return buildSesEmailCommand({
    toEmail: props.toEmail,
    emailType: "welcome-email",
    subject: "Welcome to Business.NJ.gov",
    htmlBody,
  });
};

const buildMessageRecord = (props: {
  userId: string;
  channel: MessageChannel;
  templateId: MessageTemplateId;
  topic: MessageTopic;
  templateData: { [key: string]: string | object | [] };
}): MessageData => {
  const messageTaskId = uuidv4();
  const currentDate = new Date().toISOString();
  return {
    taskId: messageTaskId,
    userId: props.userId,
    channel: props.channel,
    templateId: props.templateId,
    topic: props.topic,
    templateData: props.templateData,
    dueAt: currentDate,
    deliveredAt: currentDate,
    dateCreated: currentDate,
  };
};

const buildSesEmailCommand = (props: {
  toEmail: string;
  emailType: string;
  subject: string;
  fallbackText?: string;
  htmlBody: string;
}): SendEmailCommand => {
  const input: SendEmailCommandInput = {
    Source: "no-reply@business.nj.gov",
    Destination: {
      ToAddresses: [props.toEmail],
      CcAddresses: [],
      BccAddresses: [],
    },
    Message: {
      Subject: {
        Data: props.subject,
        Charset: "utf8",
      },
      Body: {
        Text: {
          Data: props.fallbackText ?? props.subject,
          Charset: "utf8",
        },
        Html: {
          Data: props.htmlBody,
          Charset: "utf8",
        },
      },
    },
    ReplyToAddresses: ["support@business.nj.gov"],
    Tags: [
      {
        Name: "type",
        Value: props.emailType,
      },
    ],
  };
  return new SendEmailCommand(input);
};

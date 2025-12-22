import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendEmailCommand, SendEmailCommandInput, SESClient } from "@aws-sdk/client-ses";
import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoMessagesDataClient } from "@db/DynamoMessagesDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import {
  EmailType,
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
import { LogWriter, LogWriterType } from "@libs/logWriter";
import { getConfigValue, USER_MESSAGING_CONFIG_VARS } from "@libs/ssmUtils";
import { v4 as uuidv4 } from "uuid";
// eslint-disable-next-line no-restricted-imports
import welcomeEmailShortVersionTemplate from "./email-templates/welcomeEmailShortVersion.html";
// eslint-disable-next-line no-restricted-imports
import welcomeEmailShortVersionPlaintext from "./email-templates/welcomeEmailShortVersion.txt";
// eslint-disable-next-line no-restricted-imports
import testReminderHtmlTemplate from "./emails/testReminderEmail.html";

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
  const logId = logger.GetId();

  const s3Client = new S3Client({});
  const messagesBucketName = process.env.MESSAGES_BUCKET;
  if (!messagesBucketName) throw new Error("MessagingServiceClient - MESSAGES_BUCKET is not set.");
  const dynamoDb = createDynamoDbClient(IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const messageDataClient = DynamoMessagesDataClient(dynamoDb, MESSAGES_TABLE, logger);
  const userDataClient = DynamoUserDataClient(
    dynamoDb,
    AWSTaxIDEncryptionClient,
    USERS_TABLE,
    logger,
  );

  const userData = await userDataClient.get(event.userId);

  const isReminderEmail = event.messageType === "reminder-email";
  if (isReminderEmail && !userData.user.receiveUpdatesAndReminders) {
    logger.LogInfo(
      `MessagingServiceClient - Skipping ${event.messageType} email for userId: ${event.userId} - user is not subscribed to reminders`,
    );
    return {
      statusCode: 200,
      messageId: "skipped",
      body: JSON.stringify({
        skipped: true,
        reason: "user_not_subscribed",
        userId: event.userId,
        messageType: event.messageType,
      }),
    };
  }

  if (
    isReminderEmail &&
    (await getConfigValue("feature_reminder_emails_enabled" as USER_MESSAGING_CONFIG_VARS)) !==
      "true"
  ) {
    logger.LogInfo(
      `MessagingServiceClient - Skipping ${event.messageType} email for userId: ${event.userId} - reminder emails feature is not enabled`,
    );
    return {
      statusCode: 200,
      messageId: "skipped",
      body: JSON.stringify({
        skipped: true,
        reason: "feature_not_enabled",
        userId: event.userId,
        messageType: event.messageType,
      }),
    };
  }

  const toEmail = userData.user.email;

  let command: SendEmailCommand;
  let message: MessageData;

  if (isReminderEmail) {
    command = buildReminderEmail({ toEmail });
    message = buildMessageRecord({
      userId: userData.user.id,
      channel: "email",
      templateId: "test-reminder-v1",
      topic: "reminder",
      templateData: {},
    });
  } else {
    command = buildWelcomeEmail({ toEmail });
    message = buildMessageRecord({
      userId: userData.user.id,
      channel: "email",
      templateId: "welcome_version-B",
      topic: "welcome",
      templateData: { name: userData.user.name || "" },
    });
  }

  try {
    logger.LogInfo(`MessagingServiceClient - Sending email to ${toEmail}`);
    const sendEmailOutput = await sesClient.send(command);
    logger.LogInfo(
      `MessagingServiceClient - Successfully sent email to ${toEmail}, ${JSON.stringify(sendEmailOutput)}`,
    );
    await messageDataClient.put(message);
    logger.LogInfo(`MessagingServiceClient - Successfully logged message ${message.taskId}`);
    await writeToS3({
      s3Client,
      bucketName: messagesBucketName,
      filename: `${message.deliveredAt}-${message.taskId}`,
      content: JSON.stringify(command.input, undefined, 2),
      logger,
      logId,
    });
  } catch (error) {
    logger.LogError(
      `MessagingServiceClient - Error sending or logging message ${message.taskId} to ${toEmail}: ${error}`,
    );
  }

  return {
    statusCode: 200,
    messageId: message.taskId,
    body: JSON.stringify(message),
  };
};

const buildWelcomeEmail = (props: { toEmail: string }): SendEmailCommand => {
  return buildSesEmailCommand({
    toEmail: props.toEmail,
    emailType: "welcome-email-b",
    subject: "Welcome to Business.NJ.gov",
    htmlBody: welcomeEmailShortVersionTemplate,
    fallbackText: welcomeEmailShortVersionPlaintext,
  });
};

const buildReminderEmail = (props: { toEmail: string }): SendEmailCommand => {
  return buildSesEmailCommand({
    toEmail: props.toEmail,
    emailType: "reminder-email",
    subject: "Incomplete Tasks Reminder - Business.NJ.gov",
    htmlBody: testReminderHtmlTemplate,
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
  emailType: EmailType;
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
    ConfigurationSetName: props.emailType,
  };
  return new SendEmailCommand(input);
};

const writeToS3 = async (props: {
  s3Client: S3Client;
  bucketName: string;
  filename: string;
  content: string;
  logger: LogWriterType;
  logId: string;
}): Promise<void> => {
  await props.s3Client
    .send(
      new PutObjectCommand({
        Bucket: props.bucketName,
        Key: props.filename,
        Body: props.content,
        ContentType: "text/plain",
      }),
    )
    .then(() => {
      props.logger.LogInfo(
        `MessagingServiceClient - Id:${props.logId} - Successfully wrote ${props.filename} to ${props.bucketName}.`,
      );
    })
    .catch((error) => {
      props.logger.LogInfo(
        `MessagingServiceClient - Id:${props.logId} - Failed to write ${props.filename} to ${props.bucketName}. Received error: ${error}`,
      );
    });
};

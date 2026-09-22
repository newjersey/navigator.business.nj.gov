import { DatabaseClient, MessagingServiceClient } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import { UserData } from "@shared/userData";
import dayjs from "dayjs";
import { createHmac } from "node:crypto";

export interface CreateUserRecordParams {
  readonly userData: UserData;
  readonly databaseClient: DatabaseClient;
  readonly messagingServiceClient: MessagingServiceClient;
  readonly logger: LogWriterType;
  readonly myNJUserKey?: string;
}

const hashForIntercom = (value: string): string => {
  return createHmac("sha256", process.env.INTERCOM_HASH_SECRET || "")
    .update(value)
    .digest("hex");
};

const sendWelcomeMessage = async (
  userId: string,
  messagingServiceClient: MessagingServiceClient,
  logger: LogWriterType,
): Promise<void> => {
  try {
    const result = await messagingServiceClient.sendMessage(userId, "welcome-email");
    if (result.success) {
      logger.LogInfo(
        `Welcome message sent successfully for userId: ${userId}, messageId: ${result.messageId}`,
      );
    } else {
      logger.LogError(`Failed to send welcome message for userId: ${userId}: ${result.error}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.LogError(`Error sending welcome message for userId: ${userId}: ${message}`);
  }
};

export const createUserRecord = async ({
  userData,
  databaseClient,
  messagingServiceClient,
  logger,
  myNJUserKey,
}: CreateUserRecordParams): Promise<UserData> => {
  const nowISO = dayjs().toISOString();

  const savedUserData = await databaseClient.put({
    ...userData,
    user: {
      ...userData.user,
      ...(myNJUserKey ? { myNJUserKey } : {}),
      intercomHash: hashForIntercom(myNJUserKey ?? userData.user.id),
    },
    dateCreatedISO: nowISO,
    lastUpdatedISO: nowISO,
  });

  const welcomeEmailEnabled = (await getConfigValue("feature_welcome_email_enabled")) === "true";
  if (welcomeEmailEnabled) {
    await sendWelcomeMessage(userData.user.id, messagingServiceClient, logger);
  }

  return savedUserData;
};

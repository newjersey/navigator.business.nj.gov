import { DatabaseClient, MessagingServiceClient, SelfRegClient } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { UserData } from "@shared/userData";
import dayjs from "dayjs";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { createHmac } from "node:crypto";

type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? Mutable<T[P]> : T[P];
};

export const selfRegRouterFactory = (
  databaseClient: DatabaseClient,
  selfRegClient: SelfRegClient,
  messagingServiceClient: MessagingServiceClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/self-reg", async (req, res) => {
    const userData = req.body as UserData;
    const mutableClone = structuredClone(userData) as Mutable<UserData>;
    mutableClone.user.email = mutableClone.user.email.toLowerCase().normalize();
    const cleanedUserData: UserData = mutableClone as UserData;

    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received self-registration request for user: ${cleanedUserData.user.email}`,
    );
    try {
      const status = StatusCodes.OK;
      const selfRegResponse = await (cleanedUserData.user.myNJUserKey
        ? selfRegClient.resume(cleanedUserData.user.myNJUserKey)
        : selfRegClient.grant(cleanedUserData.user));
      const updatedUserData = await updateMyNJKey(cleanedUserData, selfRegResponse.myNJUserKey);

      messagingServiceClient
        .sendMessage(cleanedUserData.user.id, "welcome-email")
        .then((result) => {
          if (result.success) {
            logger.LogInfo(
              `Welcome message sent successfully for userId: ${cleanedUserData.user.id}, messageId: ${result.messageId}`,
            );
          } else {
            logger.LogError(
              `Failed to send welcome message for userId: ${cleanedUserData.user.id}: ${result.error}`,
            );
          }
        })
        .catch((error) => {
          logger.LogError(
            `Error sending welcome message for userId: ${cleanedUserData.user.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
        });

      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, successfully completed self-registration for user: ${
          cleanedUserData.user.email
        }, duration: ${getDurationMs(requestStart)}ms`,
      );
      res
        .status(status)
        .json({ authRedirectURL: selfRegResponse.authRedirectURL, userData: updatedUserData });
    } catch (error) {
      const status =
        error instanceof Error && error.message === "DUPLICATE_SIGNUP"
          ? StatusCodes.CONFLICT
          : StatusCodes.INTERNAL_SERVER_ERROR;

      const message = error instanceof Error ? error.message : String(error);
      logger.LogError(
        `${method} ${endpoint} - Failed to complete self-registration: ${message}, status: ${status}, user: ${
          cleanedUserData.user.email
        }, duration: ${getDurationMs(requestStart)}ms`,
      );
      res.status(status).send({ error: message });
    }
  });

  const updateMyNJKey = (userData: UserData, myNJUserKey: string): Promise<UserData> => {
    const hmac = createHmac("sha256", process.env.INTERCOM_HASH_SECRET || "");
    const hash = hmac.update(myNJUserKey).digest("hex");
    return databaseClient.put({
      ...userData,
      user: {
        ...userData.user,
        myNJUserKey: myNJUserKey,
        intercomHash: hash,
      },
      dateCreatedISO: dayjs().toISOString(),
      lastUpdatedISO: dayjs().toISOString(),
    });
  };

  return router;
};

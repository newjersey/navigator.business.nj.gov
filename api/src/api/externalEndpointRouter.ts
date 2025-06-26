import { getSignedInUserId } from "@api/userRouter";
import { shouldAddToNewsletter } from "@domain/newsletter/shouldAddToNewsletter";
import { AddNewsletter, AddToUserTesting, DatabaseClient } from "@domain/types";
import { shouldAddToUserTesting } from "@domain/user-testing/shouldAddToUserTesting";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const externalEndpointRouterFactory = (
  databaseClient: DatabaseClient,
  addNewsletter: AddNewsletter,
  addToUserTesting: AddToUserTesting,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/newsletter", async (req, res) => {
    let userData = req.body as UserData;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const userId = userData.user.id;
    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received request to update newsletter preferences for userId: ${userId}`,
    );
    let isAnonymous;
    try {
      isAnonymous = getSignedInUserId(req) !== userId;
    } catch {
      isAnonymous = true;
    }

    if (shouldAddToNewsletter(userData)) {
      userData = await addNewsletter(userData);
      if (!isAnonymous) {
        try {
          userData = await databaseClient.put(userData);
        } catch (error) {
          const status = StatusCodes.INTERNAL_SERVER_ERROR;
          const message = error instanceof Error ? error.message : "Unexpected error";
          logger.LogError(
            `${method} ${endpoint} - Failed to update user: ${message}, status: ${status}, userId: ${userId}, duration: ${getDurationMs(
              requestStart,
            )}ms`,
          );
          res.status(status).json({ error: message });
          return;
        }
      }
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${
          StatusCodes.OK
        }, successfully updated newsletter preferences for userId: ${userId}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
    } else {
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${
          StatusCodes.OK
        }, no update to newsletter preferences needed for userId: ${userId}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
    }

    res.status(StatusCodes.OK).json(userData);
  });

  router.post("/userTesting", async (req, res) => {
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    let userData = req.body as UserData;
    const userId = userData.user.id;
    let isAnonymous;
    try {
      isAnonymous = getSignedInUserId(req) !== userId;
    } catch {
      isAnonymous = true;
    }

    if (shouldAddToUserTesting(userData)) {
      userData = await addToUserTesting(userData);
      if (!isAnonymous) {
        try {
          userData = await databaseClient.put(userData);
        } catch (error) {
          const status = StatusCodes.INTERNAL_SERVER_ERROR;
          const message = error instanceof Error ? error.message : "Unexpected error";
          logger.LogError(
            `${method} ${endpoint} - Failed to update user: ${message}, status: ${status}, userId: ${userId}, duration: ${getDurationMs(
              requestStart,
            )}ms`,
          );
          res.status(status).json({ error: message });
          return;
        }
      }

      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${
          StatusCodes.OK
        }, successfully updated user testing preferences for userId: ${userId}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
    } else {
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${
          StatusCodes.OK
        }, no update to user testing preferences needed for userId: ${userId}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
    }

    res.status(StatusCodes.OK).json(userData);
  });

  return router;
};

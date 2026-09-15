import { getSignedInUserId } from "@api/userRouter";
import { shouldAddToNewsletter } from "@domain/newsletter/shouldAddToNewsletter";
import { AddNewsletter, DatabaseClient, NewsletterClient } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { validateEmail } from "@shared/stringHelpers";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const externalEndpointRouterFactory = (
  databaseClient: DatabaseClient,
  addNewsletter: AddNewsletter,
  newsletterClient: NewsletterClient,
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

  router.post("/newsletter/subscribe", async (req, res) => {
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const { email } = req.body as { email?: unknown };

    if (typeof email !== "string" || !validateEmail(email)) {
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${
          StatusCodes.BAD_REQUEST
        }, rejected invalid email, duration: ${getDurationMs(requestStart)}ms`,
      );
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid email" });
      return;
    }

    const result = await newsletterClient.add(email);
    logger.LogInfo(
      `[END] ${method} ${endpoint} - status: ${
        StatusCodes.OK
      }, newsletter subscribe result: ${result.status}, duration: ${getDurationMs(requestStart)}ms`,
    );
    res.status(StatusCodes.OK).json(result);
  });

  return router;
};

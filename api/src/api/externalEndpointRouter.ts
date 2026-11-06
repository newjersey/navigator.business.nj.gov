import { shouldAddToNewsletter } from "@domain/newsletter/shouldAddToNewsletter";
import type { AddNewsletter, NewsletterClient } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { validateEmail } from "@shared/stringHelpers";
import type { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const externalEndpointRouterFactory = (
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

    if (shouldAddToNewsletter(userData)) {
      userData = await addNewsletter(userData);
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
    // A failure to reach GovDelivery is an upstream outage, not a rejected
    // subscription. Surfacing it as 502 keeps it visible in gateway metrics
    // instead of being averaged into a 100% success rate.
    const status = result.status === "CONNECTION_ERROR" ? StatusCodes.BAD_GATEWAY : StatusCodes.OK;
    logger.LogInfo(
      `[END] ${method} ${endpoint} - status: ${status}, newsletter subscribe result: ${
        result.status
      }, duration: ${getDurationMs(requestStart)}ms`,
    );
    res.status(status).json(result);
  });

  return router;
};

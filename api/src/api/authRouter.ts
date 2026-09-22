import { chooseCanonicalAccount } from "@domain/auth/chooseCanonicalAccount";
import { CognitoUserClient, DatabaseClient } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import { LogWriterType } from "@libs/logWriter";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

const MYNJ_USERNAME_PREFIX = "myNJ_";

const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const authRouterFactory = (
  databaseClient: DatabaseClient,
  cognitoUserClient: CognitoUserClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  // Never log the resolved username alongside the email it came from.
  router.post("/auth/resolve", async (req, res) => {
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const { email } = req.body as { email?: unknown };

    logger.LogInfo(`[START] ${method} ${endpoint}`);

    if (typeof email !== "string" || email.trim() === "") {
      const status = StatusCodes.BAD_REQUEST;
      res.status(status).send({ error: "`email` property required." });
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, duration: ${getDurationMs(requestStart)}`,
      );
      return;
    }

    try {
      const accounts = await databaseClient.findAllByEmail(normalizeEmail(email));
      const candidates = accounts.filter((account) => !account.consolidatedInto);

      // v1 ships the single-account path only. An email on two or more accounts goes
      // back to myNJ rather than through the canonical pick, which has never faced real
      // duplicate data. Removing this block is how the multi-account path turns on.
      if (candidates.length >= 2) {
        const status = StatusCodes.CONFLICT;
        res.status(status).send({ error: "MULTIPLE_ACCOUNTS" });
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, reason: multiple accounts, count: ${
            candidates.length
          }, duration: ${getDurationMs(requestStart)}`,
        );
        return;
      }

      const canonical = chooseCanonicalAccount(candidates);

      if (!canonical) {
        const status = StatusCodes.NOT_FOUND;
        res.status(status).send({ error: "No account found." });
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, duration: ${getDurationMs(requestStart)}`,
        );
        return;
      }

      const username = await cognitoUserClient.findUsername([
        `${MYNJ_USERNAME_PREFIX}${canonical.user.id}`,
        canonical.user.id,
      ]);

      if (!username) {
        const status = StatusCodes.NOT_FOUND;
        logger.LogError(`${method} ${endpoint} - user record has no matching Cognito user`);
        res.status(status).send({ error: "No account found." });
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, reason: no cognito user, duration: ${getDurationMs(
            requestStart,
          )}`,
        );
        return;
      }

      await cognitoUserClient.ensureSignInEnabled(username);

      const status = StatusCodes.OK;
      res.status(status).send({ username });
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, duration: ${getDurationMs(requestStart)}`,
      );
    } catch (error: unknown) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.LogError(`[ERROR] ${method} ${endpoint} - ${message}`);
      res.status(status).send({ error: "Internal server error." });
      logger.LogInfo(
        `[END] ${method} ${endpoint} - status: ${status}, duration: ${getDurationMs(requestStart)}`,
      );
    }
  });

  return router;
};

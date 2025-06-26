import { getAnnualFilings } from "@domain/annual-filings/getAnnualFilings";
import { TimeStampBusinessSearch } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const guestRouterFactory = (
  timeStampBusinessSearch: TimeStampBusinessSearch,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/annualFilings", async (req, res) => {
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();

    const userId = (req.body as UserData).user.id;

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received request to generate annual filings for userId: ${userId}`,
    );
    try {
      res.json(getAnnualFilings(req.body as UserData));
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : "Unexpected error";
      logger.LogError(
        `${method} ${endpoint} - Failed to get annual filings: ${message}, status: ${status}, userId: ${userId}, duration: ${
          Date.now() - requestStart
        }ms`,
      );
      res.status(status).json({ error: message });
    }
  });

  router.get("/business-name-availability", async (req, res) => {
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const query = req.query.query as string;

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received request to check business name availability for query: ${query}`,
    );

    timeStampBusinessSearch
      .search(query)
      .then((nameAvailability) => {
        const status = StatusCodes.OK;
        res.status(status).json(nameAvailability);
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, query: ${query}, duration: ${
            Date.now() - requestStart
          }ms`,
        );
      })
      .catch((error) => {
        const isBadInput = error === "BAD_INPUT";
        const status = isBadInput ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR;
        const message = isBadInput ? "Invalid business name query" : "Unexpected error";
        logger.LogError(
          `${method} ${endpoint} - Failed to search business name: ${message}, status: ${status}, query: ${query}, duration: ${
            Date.now() - requestStart
          }ms`,
        );
        res.status(status).json({ error });
      });
  });
  return router;
};

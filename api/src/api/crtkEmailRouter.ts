import { PowerAutomateEmailClient } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const crtkEmailRouter = (
  powerAutomateClient: PowerAutomateEmailClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/crtk-email", async (req, res) => {
    const { emailMetaData } = req.body;

    try {
      const response = await powerAutomateClient.sendEmail(emailMetaData);
      logger.LogInfo(response.message);
      if (response.statusCode === 200) {
        const status = StatusCodes.OK;
        res.status(status).json("SUCCESS");
      } else {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        logger.LogError(`Failed to send CRTK email: ${response.message}`);
        res.status(status).json("FAILED");
      }
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.LogError(errorMessage);
      res.status(status).json("FAILED");
    }
  });

  return router;
};

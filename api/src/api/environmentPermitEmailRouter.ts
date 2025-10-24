import { EnvironmentPermitEmailClient } from "@businessnjgovnavigator/shared";
import type { LogWriterType } from "@libs/logWriter";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const environmentPermitEmailRouter = (
  environmentPermitEmailClient: EnvironmentPermitEmailClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/environment-permit-email", async (req, res) => {
    const { emailMetaData } = req.body;

    try {
      const response = await environmentPermitEmailClient.sendEmail(emailMetaData);
      logger.LogInfo(response);
      const status = StatusCodes.OK;
      res.status(status).json("SUCCESS");
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.LogError(errorMessage);
      res.status(status).json("FAILED");
    }
  });

  return router;
};

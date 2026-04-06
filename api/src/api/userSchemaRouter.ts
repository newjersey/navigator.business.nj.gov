import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { userSchemaTs } from "@domain/userSchema.generated";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

export const userSchemaRouterFactory = (logger: LogWriterType): Router => {
  const router = Router();

  router.get("/user-schema", (_req, res) => {
    const method = _req.method;
    const endpoint = _req.originalUrl;
    const requestStart = Date.now();

    logger.LogInfo(`[START] ${method} ${endpoint}`);
    const status = StatusCodes.OK;
    logger.LogInfo(
      `[END] ${method} ${endpoint} - status: ${status}, duration: ${getDurationMs(requestStart)}ms`,
    );
    res.status(status).type("text/plain").send(userSchemaTs);
  });

  return router;
};

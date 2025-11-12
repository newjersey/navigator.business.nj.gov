import type { DatabaseClient, UpdateCRTK } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import { Router } from "express";

export const crtkLookupRouterFactory = (
  updateCRTKStatus: UpdateCRTK,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/crtk-lookup", async (req, res) => {
    // const userId = getSignedInUserId(req);
    // const method = req.method;
    // const endpoint = req.originalUrl;
    const requestStart = Date.now();
    // const { facilityDetails } = req.body;

    console.log("--------------------");
    console.log({ req, res, databaseClient, updateCRTKStatus, logger });
    console.log("HIT BACKEND We cooking 🧑‍🍳🧑‍🍳🧑‍🍳");
    console.log("Date Time", requestStart);
    console.log("--------------------");

    //logger.LogInfo(`[START] ${method} ${endpoint} - userId: ${userId}`);
    //const userData = await databaseClient.get(userId);

    // updateXrayRegistrationStatus(userData, facilityDetails)
    //   .then(async (response: UserData) => {
    //     const status = StatusCodes.OK;
    //     const updatedUserData = await databaseClient.put(response);
    //     logger.LogInfo(
    //       `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, successfully updated x-ray registration, duration: ${getDurationMs(
    //         requestStart,
    //       )}ms`,
    //     );
    //     res.json(updatedUserData);
    //   })
    //   .catch((error) => {
    //     const status = StatusCodes.INTERNAL_SERVER_ERROR;
    //     const message = error instanceof Error ? error.message : String(error);
    //     logger.LogError(
    //       `${method} ${endpoint} - Failed to update x-ray registration: ${message}, status: ${status}, userId: ${userId}, duration: ${getDurationMs(
    //         requestStart,
    //       )}ms`,
    //     );
    //     res.status(status).json({ error });
    //   });
  });

  return router;
};

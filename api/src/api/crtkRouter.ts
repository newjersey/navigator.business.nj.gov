import type { CRTKStatusLookup, DatabaseClient } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

// interface CRTKLookupRequest {
//   businessName: string;
//   addressLine1: string;
//   city: string;
//   addressZipCode: string;
//   ein?: string;
// }

export const crtkLookupRouterFactory = (
  crtkStatusLookup: CRTKStatusLookup,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/crtk-lookup", async (req, res) => {
    console.log({
      crtkStatusLookup,
      databaseClient,
      logger,
    });
    const status = StatusCodes.OK;

    res.status(status).json({
      lastUpdatedISO: "2024-11-18T10:30:00Z",
      CRTKBusinessDetails: {
        businessName: "Acme Corporation",
        addressLine1: "123 Main Street",
        city: "San Francisco",
        addressZipCode: "94102",
      },
      CRTKSearchResult: "FOUND",
    });

    // const userId = getSignedInUserId(req);
    // const method = req.method;
    // const endpoint = req.originalUrl;
    // const requestStart = Date.now();

    // const { businessName, addressLine1, city, addressZipCode, ein }: CRTKLookupRequest = req.body;
    // logger.LogInfo(`[START] ${method} ${endpoint} - userId: ${userId}`);

    // const userData = await databaseClient.get(userId);

    // crtkStatusLookup
    //   .getStatus(businessName, addressLine1, city, addressZipCode, ein)
    //   .then(async (crtkData) => {
    //     // Update user data with CRTK results
    //     const updatedUserData = {
    //       ...userData,
    //       businesses: {
    //         ...userData.businesses,
    //         [userData.currentBusinessId]: {
    //           ...userData.businesses[userData.currentBusinessId],
    //           crtkData: crtkData,
    //         },
    //       },
    //     };

    //     // Save updated data to database
    //     const savedUserData = await databaseClient.put(updatedUserData);
    //     const status = StatusCodes.OK;

    //     logger.LogInfo(
    //       `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, ` +
    //         `CRTK result: ${crtkData.CRTKSearchResult}, duration: ${getDurationMs(requestStart)}ms`,
    //     );

    //     res.status(status).json(savedUserData);
    //   })
    //   .catch((error) => {
    //     const status = StatusCodes.INTERNAL_SERVER_ERROR;
    //     const message = error instanceof Error ? error.message : String(error);

    //     logger.LogError(
    //       `${method} ${endpoint} - Failed CRTK lookup: ${message}, ` +
    //         `status: ${status}, userId: ${userId}, duration: ${getDurationMs(requestStart)}ms`,
    //     );

    //     res.status(status).json({
    //       error: "SEARCH_FAILED",
    //       message: message,
    //     });
    //   });
  });

  return router;
};

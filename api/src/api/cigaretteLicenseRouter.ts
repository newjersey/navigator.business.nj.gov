import { ExpressRequestBody } from "@api/types";
import { DatabaseClient, CigaretteLicenseClient } from "@domain/types";
import { getSignedInUserId } from "@api/userRouter";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import {
  CigaretteLicensePreparePaymentResponse,
  CigaretteLicenseGetOrderByTokenResponse,
  CigaretteLicenseOrderDetails,
} from "@client/ApiCigaretteLicenseHelpers";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

type CigaretteLicensePostBody = {
  userData: UserData;
  returnUrl: string;
};

export const cigaretteLicenseRouterFactory = (
  cigaretteLicenseClient: CigaretteLicenseClient,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post(
    "/cigarette-license/prepare-payment",
    async (req: ExpressRequestBody<CigaretteLicensePostBody>, res) => {
      const { userData, returnUrl } = req.body;
      const method = req.method;
      const endpoint = req.originalUrl;
      const requestStart = Date.now();
      const userId = userData.user.id;

      logger.LogInfo(
        `[START] ${method} ${endpoint} - Received cigarette license prepare-payment request for userId: ${userId}`,
      );

      cigaretteLicenseClient
        .preparePayment(userData, returnUrl)
        .then(async (paymentResponse: CigaretteLicensePreparePaymentResponse) => {
          if (!paymentResponse.token || paymentResponse.errorResult) {
            const status = StatusCodes.OK;
            logger.LogError(
              `${method} ${endpoint} - Failed to submit cigarette license payment: error: ${paymentResponse.errorResult?.userMessage}, userId: ${userId}, duration: ${getDurationMs(
                requestStart,
              )}ms`,
            );
            res.status(status).json(paymentResponse.errorResult);
            return;
          }
          const userDataWithResponse = modifyCurrentBusiness(userData, (business) => ({
            ...business,
            cigaretteLicenseData: {
              ...business.cigaretteLicenseData,
              paymentInfo: {
                token: paymentResponse.token,
              },
            },
          }));

          await databaseClient.put(userDataWithResponse);
          const status = StatusCodes.OK;
          res.status(status).json({ userData: userDataWithResponse, paymentInfo: paymentResponse });
          logger.LogInfo(
            `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, duration: ${getDurationMs(
              requestStart,
            )}ms`,
          );
        })
        .catch((error: Error) => {
          const status = StatusCodes.INTERNAL_SERVER_ERROR;
          logger.LogError(
            `${method} ${endpoint} - Failed to submit cigarette license payment: status: ${status}, userId: ${userId}, duration: ${getDurationMs(requestStart)}, error: ${error.message}`,
          );
          res.status(status).json(error);
        });
    },
  );

  router.get("/cigarette-license/get-order-by-token", async (req, res) => {
    const signedInUserId = getSignedInUserId(req);
    const userData = await databaseClient.get(signedInUserId);
    const currentBusiness = getCurrentBusiness(userData);

    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const userId = userData.user.id;

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received Get Cigarette License Order By Token request for userId: ${userId}`,
    );

    if (!currentBusiness.cigaretteLicenseData?.paymentInfo?.token) {
      const status = StatusCodes.BAD_REQUEST;
      logger.LogError(
        `${method} ${endpoint} - No cigarette license order token found for userId: ${userId}, status: ${status}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
      res.status(status).send("No cigarette license order token");
      return;
    }

    cigaretteLicenseClient
      .getOrderByToken(currentBusiness.cigaretteLicenseData?.paymentInfo?.token)
      .then(async (getOrderResponse: CigaretteLicenseGetOrderByTokenResponse) => {
        if (
          getOrderResponse.matchingOrders === 0 ||
          getOrderResponse.errorResult ||
          !getOrderResponse.orders
        ) {
          const status = StatusCodes.OK;
          logger.LogError(
            `${method} ${endpoint} - Failed to get cigarette license order by token: error: ${getOrderResponse.errorResult?.userMessage}, userId: ${userId}, duration: ${getDurationMs(
              requestStart,
            )}ms`,
          );
          res.status(status).json(getOrderResponse.errorResult);
          return;
        }

        const order: CigaretteLicenseOrderDetails = getOrderResponse.orders[0];
        const userDataWithResponse = modifyCurrentBusiness(userData, (business) => ({
          ...business,
          cigaretteLicenseData: {
            ...business.cigaretteLicenseData,
            paymentInfo: {
              ...business.cigaretteLicenseData?.paymentInfo,
              orderId: order.orderId,
              orderStatus: order.orderStatus,
              orderTimestamp: order.timestamp,
            },
          },
        }));
        await databaseClient.put(userDataWithResponse);
        // TODO: Make call to send email confirmation

        const status = StatusCodes.OK;
        logger.LogInfo(
          `[END] ${method} ${endpoint} - Retrieved cigarette license order by token: status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json(userDataWithResponse);
      })
      .catch((error: Error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        logger.LogError(
          `${method} ${endpoint} - Failed to get cigarette license order by token: status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}, error: ${error.message}`,
        );
        res.status(status).json(error);
      });
  });

  return router;
};

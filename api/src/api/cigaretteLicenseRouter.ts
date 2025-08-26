import { ExpressRequestBody } from "@api/types";
import { type CryptoClient, DatabaseClient, CigaretteLicenseClient } from "@domain/types";
import { getSignedInUserId } from "@api/userRouter";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import {
  EmailConfirmationResponse,
  GetOrderByTokenResponse,
  OrderDetails,
  PreparePaymentResponse,
} from "@shared/cigaretteLicense";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

interface CigaretteLicensePreparePaymentBody {
  userData: UserData;
  returnUrl: string;
}

export const cigaretteLicenseRouterFactory = (
  cigaretteLicenseClient: CigaretteLicenseClient,
  cryptoClient: CryptoClient,
  databaseClient: DatabaseClient,
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post(
    "/cigarette-license/prepare-payment",
    async (req: ExpressRequestBody<CigaretteLicensePreparePaymentBody>, res) => {
      const { userData, returnUrl } = req.body;
      const method = req.method;
      const endpoint = req.originalUrl;
      const requestStart = Date.now();
      const userId = userData.user.id;

      logger.LogInfo(
        `[START] ${method} ${endpoint} - Received cigarette license prepare-payment request for userId: ${userId}`,
      );

      try {
        const paymentResponse: PreparePaymentResponse = await cigaretteLicenseClient.preparePayment(
          userData,
          returnUrl,
        );

        if (!paymentResponse.token || paymentResponse.errorResult) {
          const status = StatusCodes.OK;
          logger.LogError(
            `${method} ${endpoint} - Failed to submit cigarette license payment: error: ${paymentResponse.errorResult?.userMessage}, userId: ${userId}, duration: ${getDurationMs(
              requestStart,
            )}ms`,
          );
          res.status(status).json({ userData, paymentInfo: paymentResponse });
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
      } catch (error) {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to submit cigarette license payment: status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms, error: ${message}`,
        );
        res.status(status).json(error);
      }
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

    if (!currentBusiness?.cigaretteLicenseData?.paymentInfo?.token) {
      const status = StatusCodes.BAD_REQUEST;
      logger.LogError(
        `${method} ${endpoint} - No cigarette license order token found for userId: ${userId}, status: ${status}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
      res.status(status).send(userData);
      return;
    }

    try {
      let updatedUserData = userData;

      if (!currentBusiness?.cigaretteLicenseData?.paymentInfo?.orderId) {
        const getOrderResponse: GetOrderByTokenResponse =
          await cigaretteLicenseClient.getOrderByToken(
            currentBusiness.cigaretteLicenseData.paymentInfo.token,
          );

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
          res.status(status).send(updatedUserData);
          return;
        }
        const order: OrderDetails = getOrderResponse.orders[0];
        updatedUserData = modifyCurrentBusiness(userData, (business) => ({
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
      }

      if (!currentBusiness?.cigaretteLicenseData?.paymentInfo?.confirmationEmailsent) {
        const decryptedTaxId = await cryptoClient.decryptValue(
          currentBusiness.cigaretteLicenseData.encryptedTaxId || "",
        );

        updatedUserData = await sendEmailConfirmation(
          updatedUserData,
          decryptedTaxId,
          cigaretteLicenseClient,
          logger,
        );
      }

      await databaseClient.put(updatedUserData);

      const status = StatusCodes.OK;
      logger.LogInfo(
        `[END] ${method} ${endpoint} - Retrieved cigarette license order by token: status: ${status}, userId: ${userId}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );

      res.status(status).json(updatedUserData);
    } catch (error) {
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : String(error);
      logger.LogError(
        `${method} ${endpoint} - Failed to get cigarette license order by token: status: ${status}, userId: ${userId}, duration: ${getDurationMs(
          requestStart,
        )}ms, error: ${message}`,
      );
      res.status(status).json(error);
    }
  });

  return router;
};

export const sendEmailConfirmation = async (
  userData: UserData,
  decryptedTaxId: string,
  cigaretteLicenseClient: CigaretteLicenseClient,
  logger: LogWriterType,
): Promise<UserData> => {
  const userId = userData.user.id;
  const requestStart = Date.now();
  logger.LogInfo(
    `[START] - Received cigarette license send-email-confirmation request for userId: ${userId}`,
  );

  try {
    const response: EmailConfirmationResponse = await cigaretteLicenseClient.sendEmailConfirmation(
      userData,
      decryptedTaxId,
    );

    if (response.statusCode !== 200) {
      logger.LogError(
        `Failed to send-email-confirmation: error: ${response.message}, userId: ${userId}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
      return userData;
    }

    const userDataWithConfirmation = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      cigaretteLicenseData: {
        ...business.cigaretteLicenseData,
        paymentInfo: {
          ...business.cigaretteLicenseData?.paymentInfo,
          confirmationEmailsent: true,
        },
      },
    }));

    logger.LogInfo(
      `[END] - Successfully sent email confirmation for userId: ${userId}, duration: ${getDurationMs(
        requestStart,
      )}ms`,
    );

    return userDataWithConfirmation;
  } catch (error) {
    logger.LogError(
      `Exception during send-email-confirmation for userId: ${userId}, duration: ${getDurationMs(
        requestStart,
      )}ms, error: ${error}`,
    );
    return userData;
  }
};

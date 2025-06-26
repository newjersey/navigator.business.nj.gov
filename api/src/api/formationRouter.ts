import { ExpressRequestBody } from "@api/types";
import { getSignedInUser, getSignedInUserId } from "@api/userRouter";
import { saveFileFromUrl } from "@domain/s3Writer";
import { DatabaseClient, FormationClient } from "@domain/types";
import { getDurationMs } from "@libs/logUtils";
import type { LogWriterType } from "@libs/logWriter";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { formationTaskId } from "@shared/domain-logic/taskIds";
import { FormationSubmitResponse, GetFilingResponse, InputFile } from "@shared/formationData";
import { ProfileDocuments } from "@shared/profileData";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

type FormationPostBody = {
  userData: UserData;
  returnUrl: string;
  foreignGoodStandingFile: InputFile;
};

export const formationRouterFactory = (
  formationClient: FormationClient,
  databaseClient: DatabaseClient,
  config: { shouldSaveDocuments: boolean },
  logger: LogWriterType,
): Router => {
  const router = Router();

  router.post("/formation", async (req: ExpressRequestBody<FormationPostBody>, res) => {
    const { userData, returnUrl, foreignGoodStandingFile } = req.body;
    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const userId = userData.user.id;

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received formation request for userId: ${userId}`,
    );

    formationClient
      .form(userData, returnUrl, foreignGoodStandingFile)
      .then(async (formationResponse: FormationSubmitResponse) => {
        const userDataWithResponse = modifyCurrentBusiness(userData, (business) => ({
          ...business,
          formationData: {
            ...business.formationData,
            formationResponse: formationResponse,
          },
        }));
        await databaseClient.put(userDataWithResponse);
        const status = StatusCodes.OK;
        res.status(status).json(userDataWithResponse);
        logger.LogInfo(
          `[END] ${method} ${endpoint} - status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
      })
      .catch(async () => {
        await databaseClient.put(userData);
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        logger.LogError(
          `${method} ${endpoint} - Failed to submit formation: status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json();
      });
  });

  router.get("/completed-filing", async (req, res) => {
    const signedInUser = getSignedInUser(req);
    const signedInUserId = getSignedInUserId(req);
    const userData = await databaseClient.get(signedInUserId);
    const currentBusiness = getCurrentBusiness(userData);

    const method = req.method;
    const endpoint = req.originalUrl;
    const requestStart = Date.now();
    const userId = userData.user.id;

    logger.LogInfo(
      `[START] ${method} ${endpoint} - Received completed filing request for userId: ${userId}`,
    );

    if (!currentBusiness.formationData.formationResponse?.formationId) {
      const status = StatusCodes.BAD_REQUEST;
      logger.LogError(
        `${method} ${endpoint} - No formation ID found for userId: ${userId}, status: ${status}, duration: ${getDurationMs(
          requestStart,
        )}ms`,
      );
      res.status(status).send("No formation ID");
      return;
    }

    formationClient
      .getCompletedFiling(currentBusiness.formationData.formationResponse.formationId)
      .then(async (getFilingResponse: GetFilingResponse) => {
        const taskProgress = currentBusiness.taskProgress;
        let entityId = currentBusiness.profileData.entityId;
        let dateOfFormation = currentBusiness.profileData.dateOfFormation;
        let businessName = currentBusiness.profileData.businessName;
        let documents: ProfileDocuments = {
          certifiedDoc: "",
          formationDoc: "",
          standingDoc: "",
        };

        if (getFilingResponse.success && config.shouldSaveDocuments) {
          taskProgress[formationTaskId] = "COMPLETED";
          entityId = getFilingResponse.entityId;
          dateOfFormation = currentBusiness.formationData.formationFormData.businessStartDate;
          businessName = currentBusiness.formationData.formationFormData.businessName;

          const formationDoc = await saveFileFromUrl(
            getFilingResponse.formationDoc,
            `${signedInUser["custom:identityId"]}/formationDoc-${Date.now()}.pdf`,
            process.env.DOCUMENT_S3_BUCKET as string,
          );

          let certifiedDoc = "";
          let standingDoc = "";

          if (getFilingResponse.certifiedDoc) {
            certifiedDoc = await saveFileFromUrl(
              getFilingResponse.certifiedDoc,
              `${signedInUser["custom:identityId"]}/certifiedDoc-${Date.now()}.pdf`,
              process.env.DOCUMENT_S3_BUCKET as string,
            );
          }

          if (getFilingResponse.standingDoc) {
            standingDoc = await saveFileFromUrl(
              getFilingResponse.standingDoc,
              `${signedInUser["custom:identityId"]}/standingDoc-${Date.now()}.pdf`,
              process.env.DOCUMENT_S3_BUCKET as string,
            );
          }

          documents = {
            formationDoc,
            certifiedDoc,
            standingDoc,
          };
        }

        const userDataWithResponse = modifyCurrentBusiness(userData, (business) => ({
          ...business,
          taskProgress,
          formationData: {
            ...business.formationData,
            getFilingResponse,
          },
          profileData: {
            ...business.profileData,
            entityId,
            dateOfFormation,
            businessName,
            documents: {
              ...business.profileData.documents,
              ...documents,
            },
          },
        }));
        const status = StatusCodes.OK;
        logger.LogInfo(
          `[END] ${method} ${endpoint} - Retrieved filing data successfully: status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        await databaseClient.put(userDataWithResponse);
        res.status(status).json(userDataWithResponse);
      })
      .catch((error) => {
        const status = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        logger.LogError(
          `${method} ${endpoint} - Failed to get completed filing: ${message}, status: ${status}, userId: ${userId}, duration: ${getDurationMs(
            requestStart,
          )}ms`,
        );
        res.status(status).json();
      });
  });

  return router;
};

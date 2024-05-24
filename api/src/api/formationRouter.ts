import { ExpressRequestBody } from "@api/types";
import { getSignedInUser, getSignedInUserId } from "@api/userRouter";
import { saveFileFromUrl } from "@domain/s3Writer";
import { FormationClient, UserDataClient } from "@domain/types";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { formationTaskId } from "@shared/domain-logic/taskIds";
import { FormationSubmitResponse, GetFilingResponse, InputFile } from "@shared/formationData";
import { ProfileDocuments } from "@shared/profileData";
import { modifyCurrentBusiness } from "@shared/test";
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
  userDataClient: UserDataClient,
  config: { shouldSaveDocuments: boolean }
): Router => {
  const router = Router();

  router.post("/formation", async (req: ExpressRequestBody<FormationPostBody>, res) => {
    const { userData, returnUrl, foreignGoodStandingFile } = req.body;

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
        await userDataClient.put(userDataWithResponse);
        res.json(userDataWithResponse);
      })
      .catch(async () => {
        await userDataClient.put(userData);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
      });
  });

  router.get("/completed-filing", async (req, res) => {
    const signedInUser = getSignedInUser(req);
    const signedInUserId = getSignedInUserId(req);
    const userData = await userDataClient.get(signedInUserId);
    const currentBusiness = getCurrentBusiness(userData);

    if (!currentBusiness.formationData.formationResponse?.formationId) {
      res.status(StatusCodes.BAD_REQUEST).send("No formation ID");
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
            process.env.DOCUMENT_S3_BUCKET as string
          );

          let certifiedDoc = "";
          let standingDoc = "";

          if (getFilingResponse.certifiedDoc) {
            certifiedDoc = await saveFileFromUrl(
              getFilingResponse.certifiedDoc,
              `${signedInUser["custom:identityId"]}/certifiedDoc-${Date.now()}.pdf`,
              process.env.DOCUMENT_S3_BUCKET as string
            );
          }

          if (getFilingResponse.standingDoc) {
            standingDoc = await saveFileFromUrl(
              getFilingResponse.standingDoc,
              `${signedInUser["custom:identityId"]}/standingDoc-${Date.now()}.pdf`,
              process.env.DOCUMENT_S3_BUCKET as string
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
        await userDataClient.put(userDataWithResponse);
        res.json(userDataWithResponse);
      })
      .catch((error) => {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
      });
  });

  return router;
};

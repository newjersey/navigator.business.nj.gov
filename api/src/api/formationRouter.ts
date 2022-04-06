import { FormationSubmitResponse, GetFilingResponse } from "@shared/formationData";
import { ProfileDocuments } from "@shared/profileData";
import { Router } from "express";
import { saveFileFromUrl } from "../domain/s3Writer";
import { FormationClient, UserDataClient } from "../domain/types";
import { getSignedInUser, getSignedInUserId } from "./userRouter";

export const formationRouterFactory = (
  formationClient: FormationClient,
  userDataClient: UserDataClient
): Router => {
  const router = Router();

  router.post("/formation", async (req, res) => {
    const { userData, returnUrl } = req.body;

    formationClient
      .form(userData, returnUrl)
      .then(async (formationResponse: FormationSubmitResponse) => {
        const userDataWithResponse = {
          ...userData,
          formationData: {
            ...userData.formationData,
            formationResponse: formationResponse,
          },
        };
        await userDataClient.put(userDataWithResponse);
        res.json(userDataWithResponse);
      })
      .catch(async () => {
        await userDataClient.put(userData);
        res.status(500).json();
      });
  });

  router.get("/completed-filing", async (req, res) => {
    const signedInUser = getSignedInUser(req);
    const signedInUserId = getSignedInUserId(req);
    const userData = await userDataClient.get(signedInUserId);

    if (!userData.formationData.formationResponse?.formationId) {
      res.status(400).send("No formation ID");
      return;
    }

    formationClient
      .getCompletedFiling(userData.formationData.formationResponse.formationId)
      .then(async (getFilingResponse: GetFilingResponse) => {
        const taskProgress = userData.taskProgress;
        let entityId = userData.profileData.entityId;
        let dateOfFormation = userData.profileData.dateOfFormation;
        const documents: Partial<ProfileDocuments> = {};

        if (getFilingResponse.success) {
          taskProgress["form-business-entity"] = "COMPLETED";
          entityId = getFilingResponse.entityId;
          dateOfFormation = userData.formationData.formationFormData.businessStartDate;

          documents["formationDoc"] = await saveFileFromUrl(
            getFilingResponse.formationDoc,
            `${signedInUser["custom:identityId"]}/formationDoc-${Date.now()}.pdf`,
            process.env.DOCUMENT_S3_BUCKET as string
          );

          if (getFilingResponse.certifiedDoc) {
            documents["certifiedDoc"] = await saveFileFromUrl(
              getFilingResponse.certifiedDoc,
              `${signedInUser["custom:identityId"]}/certifiedDoc-${Date.now()}.pdf`,
              process.env.DOCUMENT_S3_BUCKET as string
            );
          }

          if (getFilingResponse.standingDoc) {
            documents["standingDoc"] = await saveFileFromUrl(
              getFilingResponse.standingDoc,
              `${signedInUser["custom:identityId"]}/standingDoc-${Date.now()}.pdf`,
              process.env.DOCUMENT_S3_BUCKET as string
            );
          }
        }
        const userDataWithResponse = {
          ...userData,
          taskProgress,
          formationData: {
            ...userData.formationData,
            getFilingResponse,
          },
          profileData: {
            ...userData.profileData,
            entityId,
            dateOfFormation,
            documents: { ...userData.profileData.documents, ...documents },
          },
        };
        await userDataClient.put(userDataWithResponse);
        res.json(userDataWithResponse);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json();
      });
  });

  return router;
};

import { FormationSubmitResponse, GetFilingResponse } from "@shared/formationData";
import { Router } from "express";
import { FormationClient, UserDataClient } from "../domain/types";
import { getSignedInUserId } from "./userRouter";

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
        let businessName = userData.profileData.businessName;
        if (getFilingResponse.success) {
          taskProgress["form-business-entity"] = "COMPLETED";
          entityId = getFilingResponse.entityId;
          businessName = userData.formationData.formationFormData.businessName;
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
            businessName,
          },
        };
        await userDataClient.put(userDataWithResponse);
        res.json(userDataWithResponse);
      })
      .catch(() => {
        res.status(500).json();
      });
  });

  return router;
};

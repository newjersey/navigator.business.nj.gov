import { FormationSubmitResponse } from "@shared/formationData";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { FormationClient, UserDataClient } from "../domain/types";

export const formationRouterFactory = (
  formationClient: FormationClient,
  userDataClient: UserDataClient
): Router => {
  const router = Router();

  router.post("/formation", async (req, res) => {
    const userData = req.body as UserData;

    formationClient
      .form(userData)
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

  return router;
};

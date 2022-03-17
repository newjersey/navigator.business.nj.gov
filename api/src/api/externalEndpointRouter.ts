import { UserData } from "@shared/userData";
import { Router } from "express";
import { shouldAddToNewsletter } from "../domain/newsletter/shouldAddToNewsletter";
import { AddNewsletter, AddToUserTesting, UserDataClient } from "../domain/types";
import { shouldAddToUserTesting } from "../domain/user-testing/shouldAddToUserTesting";
import { getSignedInUserId } from "./userRouter";

export const externalEndpointRouterFactory = (
  userDataClient: UserDataClient,
  addNewsletter: AddNewsletter,
  addToUserTesting: AddToUserTesting
): Router => {
  const router = Router();

  router.post("/newsletter", async (req, res) => {
    let userData = req.body as UserData;
    let isAnonymous;
    try {
      isAnonymous = getSignedInUserId(req) != userData.user.id;
    } catch (e) {
      isAnonymous = true;
    }

    if (shouldAddToNewsletter(userData)) {
      userData = await addNewsletter(userData);
      if (!isAnonymous) {
        try {
          userData = await userDataClient.put(userData);
        } catch (error) {
          res.status(500).json({ error });
        }
      }
    }
    res.json(userData);
  });

  router.post("/userTesting", async (req, res) => {
    let userData = req.body as UserData;
    let isAnonymous;
    try {
      isAnonymous = getSignedInUserId(req) != userData.user.id;
    } catch (e) {
      isAnonymous = true;
    }

    if (shouldAddToUserTesting(userData)) {
      userData = await addToUserTesting(userData);
      if (!isAnonymous) {
        try {
          userData = await userDataClient.put(userData);
        } catch (error) {
          res.status(500).json({ error });
        }
      }
    }
    res.json(userData);
  });

  return router;
};

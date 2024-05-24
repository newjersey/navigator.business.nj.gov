import { getSignedInUserId } from "@api/userRouter";
import { shouldAddToNewsletter } from "@domain/newsletter/shouldAddToNewsletter";
import { AddNewsletter, AddToUserTesting, UserDataClient } from "@domain/types";
import { shouldAddToUserTesting } from "@domain/user-testing/shouldAddToUserTesting";
import { UserData } from "@shared/userData";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

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
      isAnonymous = getSignedInUserId(req) !== userData.user.id;
    } catch {
      isAnonymous = true;
    }

    if (shouldAddToNewsletter(userData)) {
      userData = await addNewsletter(userData);
      if (!isAnonymous) {
        try {
          userData = await userDataClient.put(userData);
        } catch (error) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        }
      }
    }
    res.json(userData);
  });

  router.post("/userTesting", async (req, res) => {
    let userData = req.body as UserData;
    let isAnonymous;
    try {
      isAnonymous = getSignedInUserId(req) !== userData.user.id;
    } catch {
      isAnonymous = true;
    }

    if (shouldAddToUserTesting(userData)) {
      userData = await addToUserTesting(userData);
      if (!isAnonymous) {
        try {
          userData = await userDataClient.put(userData);
        } catch (error) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        }
      }
    }
    res.json(userData);
  });

  return router;
};

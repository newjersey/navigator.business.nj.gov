import { DatabaseClient, SelfRegClient } from "@domain/types";
import { UserData } from "@shared/userData";
import dayjs from "dayjs";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { createHmac } from "node:crypto";

export const selfRegRouterFactory = (
  databaseClient: DatabaseClient,
  selfRegClient: SelfRegClient
): Router => {
  const router = Router();

  router.post("/self-reg", async (req, res) => {
    const userData = req.body as UserData;
    const cleanedUserData: UserData = {
      ...userData,
      user: {
        ...userData.user,
        email: userData.user.email.toLowerCase(),
      },
    };

    try {
      const selfRegResponse = await (cleanedUserData.user.myNJUserKey
        ? selfRegClient.resume(cleanedUserData.user.myNJUserKey)
        : selfRegClient.grant(cleanedUserData.user));
      const updatedUserData = await updateMyNJKey(cleanedUserData, selfRegResponse.myNJUserKey);
      res.json({ authRedirectURL: selfRegResponse.authRedirectURL, userData: updatedUserData });
    } catch (error) {
      const message = (error as Error).message;
      if (message === "DUPLICATE_SIGNUP") {
        res.status(StatusCodes.CONFLICT).send({ error: message });
        return;
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
    }
  });

  const updateMyNJKey = (userData: UserData, myNJUserKey: string): Promise<UserData> => {
    const hmac = createHmac("sha256", process.env.INTERCOM_HASH_SECRET || "");
    const hash = hmac.update(myNJUserKey).digest("hex");
    return databaseClient.put({
      ...userData,
      user: {
        ...userData.user,
        myNJUserKey: myNJUserKey,
        intercomHash: hash,
      },
      dateCreatedISO: dayjs().toISOString(),
      lastUpdatedISO: dayjs().toISOString(),
    });
  };

  return router;
};

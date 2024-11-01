import { SelfRegClient, UnifiedDataClient } from "@domain/types";
import { UserData } from "@shared/userData";
import dayjs from "dayjs";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { createHmac } from "node:crypto";

export const selfRegRouterFactory = (
  unifiedDataClient: UnifiedDataClient,
  selfRegClient: SelfRegClient
): Router => {
  const router = Router();

  router.post("/self-reg", async (req, res) => {
    const userData = req.body as UserData;

    try {
      const selfRegResponse = await (userData.user.myNJUserKey
        ? selfRegClient.resume(userData.user.myNJUserKey)
        : selfRegClient.grant(userData.user));
      const updatedUserData = await updateMyNJKey(userData, selfRegResponse.myNJUserKey);
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
    return unifiedDataClient.addUpdatedUserToUsersAndBusinessesTable({
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

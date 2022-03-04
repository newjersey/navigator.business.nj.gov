import { UserData } from "@shared/userData";
import { createHmac } from "crypto";
import { Router } from "express";
import { SelfRegClient, UserDataClient } from "../domain/types";

export const selfRegRouterFactory = (
  userDataClient: UserDataClient,
  selfRegClient: SelfRegClient
): Router => {
  const router = Router();

  router.post("/self-reg", async (req, res) => {
    const userData = req.body as UserData;

    try {
      let selfRegResponse;
      if (!userData.user.myNJUserKey) {
        selfRegResponse = await selfRegClient.grant(userData.user);
      } else {
        selfRegResponse = await selfRegClient.resume(userData.user.myNJUserKey);
      }
      const updatedUserData = await updateMyNJKey(userData, selfRegResponse.myNJUserKey);
      res.json({ authRedirectURL: selfRegResponse.authRedirectURL, userData: updatedUserData });
    } catch (error) {
      if (error === "DUPLICATE_SIGNUP") {
        res.status(409).send(error);
        return;
      }
      res.status(500).send(error);
    }
  });

  const updateMyNJKey = (userData: UserData, myNJUserKey: string): Promise<UserData> => {
    const hmac = createHmac("sha256", process.env.INTERCOM_HASH_SECRET || "");
    const hash = hmac.update(myNJUserKey).digest("hex");
    return userDataClient.put({
      ...userData,
      user: {
        ...userData.user,
        myNJUserKey: myNJUserKey,
        intercomHash: hash,
      },
    });
  };

  return router;
};

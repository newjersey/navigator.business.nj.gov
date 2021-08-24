import { Router, Request, Response } from "express";
import { createEmptyUserData, SelfRegClient, UserData, UserDataClient } from "../domain/types";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { getTokenFromHeader, CognitoJWTPayload } from "./userRouter";
export const selfRegRouterFactory = (
  userDataClient: UserDataClient,
  selfRegClient: SelfRegClient
): Router => {
  const router = Router();

  router.post("/self-reg", async (req, res) => {
    const { email, confirmEmail, name } = req.body;
    if (email !== confirmEmail) {
      res.status(400).send("Emails do not match");
      return;
    }

    try {
      const userData = await userDataClient.findByEmail(req.body.email);

      if (!userData) {
        const emptyUserData = createEmptyUserData({
          myNJUserKey: undefined,
          email: email,
          id: uuidv4(),
          name: name,
        });

        await userDataClient.put(emptyUserData);
        const selfRegResponse = await selfRegClient.grant(emptyUserData.user);
        await updateMyNJKey(emptyUserData, selfRegResponse.myNJUserKey);

        res.json({ authRedirectURL: selfRegResponse.authRedirectURL });
      } else if (!userData.user.myNJUserKey) {
        const selfRegResponse = await selfRegClient.grant(userData.user);
        await updateMyNJKey(userData, selfRegResponse.myNJUserKey);
        res.json({ authRedirectURL: selfRegResponse.authRedirectURL });
      } else {
        const selfRegResponse = await selfRegClient.resume(userData.user.myNJUserKey);
        res.json({ authRedirectURL: selfRegResponse.authRedirectURL });
      }
    } catch (error) {
      if (error === "DUPLICATE_SIGNUP") {
        res.status(409).send(error);
        return;
      }
      res.status(500).send(error);
    }
  });

  const updateMyNJKey = (userData: UserData, myNJUserKey: string): Promise<UserData> => {
    return userDataClient.put({
      ...userData,
      user: {
        ...userData.user,
        myNJUserKey: myNJUserKey,
      },
    });
  };

  return router;
};

// Auto Register users, used in the local development environment
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const offlineAutoReg = async (
  req: Request,
  res: Response,
  userDataClient: UserDataClient,
  signedInUserId: string
) => {
  const signedInUser = jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload;
  const emptyUserData = createEmptyUserData({
    myNJUserKey: signedInUserId,
    email: signedInUser.email,
    id: signedInUserId,
    name: "",
  });
  userDataClient
    .put(emptyUserData)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

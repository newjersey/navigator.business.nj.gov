import { Request, Router } from "express";
import { UserData, UserDataClient } from "../domain/types";
import jwt from "jsonwebtoken";

const getTokenFromHeader = (req: Request): string => {
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    return req.headers.authorization.split(" ")[1];
  }
  throw new Error("Auth header missing");
};

type CognitoJWTPayload = {
  sub: string;
};

export const userRouterFactory = (userDataClient: UserDataClient): Router => {
  const router = Router();

  router.get("/users/:userId", (req, res) => {
    const signedInUserId = (jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload).sub;
    if (signedInUserId !== req.params.userId) {
      res.status(403).json();
      return;
    }

    userDataClient
      .get(req.params.userId)
      .then((result: UserData) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  router.post("/users", (req, res) => {
    const signedInUserId = (jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload).sub;
    const postedUserBodyId = (req.body as UserData).user.id;
    if (signedInUserId !== postedUserBodyId) {
      res.status(403).json();
      return;
    }

    userDataClient
      .put(req.body)
      .then((result: UserData) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  return router;
};

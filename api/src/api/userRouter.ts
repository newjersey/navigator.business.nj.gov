import { Request, Router } from "express";
import { UserData, UserHandler } from "../domain/types";
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

export const getSignedInUserId = (req: Request): string =>
  (jwt.decode(getTokenFromHeader(req)) as CognitoJWTPayload).sub;

export const userRouterFactory = (userHandler: UserHandler): Router => {
  const router = Router();

  router.get("/users/:userId", (req, res) => {
    if (getSignedInUserId(req) !== req.params.userId) {
      res.status(403).json();
      return;
    }

    userHandler
      .get(req.params.userId)
      .then((result: UserData) => {
        res.json(result);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });

  router.post("/users", (req, res) => {
    const postedUserBodyId = (req.body as UserData).user.id;
    if (getSignedInUserId(req) !== postedUserBodyId) {
      res.status(403).json();
      return;
    }

    userHandler
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

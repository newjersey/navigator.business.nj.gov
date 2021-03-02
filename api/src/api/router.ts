import { Router } from "express";
import { UserData, UserDataClient } from "../domain/types";

export const routerFactory = (userDataClient: UserDataClient): Router => {
  const router = Router();

  router.get("/users/:userId", (req, res) => {
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

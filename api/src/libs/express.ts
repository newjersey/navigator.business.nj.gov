import cors from "cors";
import express, { Express, RequestHandler } from "express";
import helmet from "helmet";

const preserveEmptyRequestBody: RequestHandler = (req, _res, next) => {
  if (req.body === undefined) {
    req.body = {};
  }
  next();
};

export const setupExpress = (enableCors = true, enableHelmet = true): Express => {
  const app = express();
  app.disable("x-powered-by");
  app.set("query parser", "extended");
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(preserveEmptyRequestBody);
  if (enableHelmet) {
    app.use(helmet());
  }
  if (enableCors) {
    app.use(cors());
  }

  return app;
};

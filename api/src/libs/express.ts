import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";

export const setupExpress = (enableCors = true, enableHelmet = true): Express => {
  const app = express();
  app.disable("x-powered-by");
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  if (enableHelmet) {
    app.use(helmet());
  }
  if (enableCors) {
    app.use(cors());
  }

  return app;
};

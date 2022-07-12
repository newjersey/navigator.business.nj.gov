import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

export const setupExpress = (enableCors = true, enableHelmet = true) => {
  const app = express();
  app.disable("x-powered-by");
  app.use(bodyParser.json());
  if (enableHelmet) {
    app.use(helmet());
  }
  if (enableCors) {
    app.use(cors());
  }

  return app;
};

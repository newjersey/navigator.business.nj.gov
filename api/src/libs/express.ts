import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

export const setupExpress = (enableCors = true) => {
  const app = express();
  app.disable("x-powered-by");
  app.use(bodyParser.json());
  app.use(helmet());
  if (enableCors) {
    app.use(cors());
  }

  return app;
};

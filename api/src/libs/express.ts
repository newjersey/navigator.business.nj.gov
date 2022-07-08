import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

export const setupExpress = (enableCors = true) => {
  const app = express();
  app.disable("x-powered-by");
  app.use(bodyParser.json());
  if (enableCors) {
    app.use(cors());
  }

  return app;
};

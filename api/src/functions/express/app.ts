import serverless from "serverless-http";
import express from "express";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import { routerFactory } from "../../api/router";
import { DynamoUserDataClient } from "../../db/DynamoUserDataClient";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const IS_OFFLINE = process.env.IS_OFFLINE;
const DYNAMO_OFFLINE_PORT = process.env.DYNAMO_PORT || 8000;
let dynamoDb: AWS.DynamoDB.DocumentClient;
if (IS_OFFLINE === "true") {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: "localhost",
    endpoint: `http://localhost:${DYNAMO_OFFLINE_PORT}`,
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE);

app.use(bodyParser.json({ strict: false }));
app.use(routerFactory(userDataClient));

app.get("/health", (_req, res) => {
  res.send("Alive");
});

export const handler = serverless(app);

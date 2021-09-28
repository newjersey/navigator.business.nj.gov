import serverless from "serverless-http";
import express from "express";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import { userRouterFactory } from "../../api/userRouter";
import { DynamoUserDataClient } from "../../db/DynamoUserDataClient";
import cors from "cors";
import { businessNameRouterFactory } from "../../api/businessNameRouter";
import { searchBusinessNameFactory } from "../../domain/business-names/searchBusinessNameFactory";
import { licenseStatusRouterFactory } from "../../api/licenseStatusRouter";
import { searchLicenseStatusFactory } from "../../domain/license-status/searchLicenseStatusFactory";
import { WebserviceLicenseStatusClient } from "../../client/WebserviceLicenseStatusClient";
import { updateLicenseStatusFactory } from "../../domain/user/updateLicenseStatusFactory";
import { WebserviceBusinessNameClient } from "../../client/WebserviceBusinessNameClient";
import { selfRegRouterFactory } from "../../api/selfRegRouter";
import { MyNJSelfRegClientFactory } from "../../client/MyNJSelfRegClient";
import { LogWriter } from "@libs/logWriter";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false; // set by serverless-offline
const IS_DOCKER = process.env.IS_DOCKER === "true" || false; // set in docker-compose

const DYNAMO_OFFLINE_PORT = process.env.DYNAMO_PORT || 8000;
let dynamoDb: AWS.DynamoDB.DocumentClient;
if (IS_OFFLINE) {
  let dynamoDbEndpoint = "localhost";
  if (IS_DOCKER) {
    dynamoDbEndpoint = "dynamodb-local";
  }
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: "localhost",
    endpoint: `http://${dynamoDbEndpoint}:${DYNAMO_OFFLINE_PORT}`,
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

const STAGE = process.env.STAGE || "local";
const logger = LogWriter(`NavigatorWebService/${STAGE}`, "SearchApis");

const LICENSE_STATUS_BASE_URL =
  process.env.LICENSE_STATUS_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const licenseStatusClient = WebserviceLicenseStatusClient(LICENSE_STATUS_BASE_URL, logger);

const BUSINESS_NAME_BASE_URL =
  process.env.BUSINESS_NAME_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const businessNameClient = WebserviceBusinessNameClient(BUSINESS_NAME_BASE_URL, logger);

const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE);

const searchBusinessName = searchBusinessNameFactory(businessNameClient);
const searchLicenseStatus = searchLicenseStatusFactory(licenseStatusClient);
const updateLicenseStatus = updateLicenseStatusFactory(userDataClient, searchLicenseStatus);

const myNJSelfRegClient = MyNJSelfRegClientFactory(
  {
    serviceToken: process.env.MYNJ_SERVICE_TOKEN || "",
    roleName: process.env.MYNJ_ROLE_NAME || "",
    serviceUrl: process.env.MYNJ_SERVICE_URL || "",
  },
  logger
);

app.use(bodyParser.json({ strict: false }));
app.use("/api", userRouterFactory(userDataClient, updateLicenseStatus));
app.use("/api", businessNameRouterFactory(searchBusinessName));
app.use("/api", licenseStatusRouterFactory(updateLicenseStatus));
app.use("/api", selfRegRouterFactory(userDataClient, myNJSelfRegClient));

app.get("/health", (_req, res) => {
  res.send("Alive");
});

export const handler = serverless(app);

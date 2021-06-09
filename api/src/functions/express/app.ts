import serverless from "serverless-http";
import express from "express";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import { userRouterFactory } from "../../api/userRouter";
import { DynamoUserDataClient } from "../../db/DynamoUserDataClient";
import cors from "cors";
import { businessNameRouterFactory } from "../../api/businessNameRouter";
import { PostgresBusinessNameRepo } from "../../db/PostgresBusinessNameRepo";
import { searchBusinessNameFactory } from "../../domain/business-names/searchBusinessNameFactory";
import { licenseStatusRouterFactory } from "../../api/licenseStatusRouter";
import { searchLicenseStatusFactory } from "../../domain/license-status/searchLicenseStatusFactory";
import { WebserviceLicenseStatusClient } from "../../client/WebserviceLicenseStatusClient";
import { LicenseStatusClient } from "../../domain/types";
import { FakeLicenseStatusClient } from "../../client/FakeLicenseStatusClient";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const connection = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "businesslocal",
  password: process.env.DB_PASSWORD || "",
  port: 5432,
};

const IS_OFFLINE = process.env.IS_OFFLINE; // set by serverless-offline

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

// feature flag for license status
const USE_FAKE_LICENSE_CLIENT = process.env.USE_FAKE_LICENSE_CLIENT;
let licenseStatusClient: LicenseStatusClient;
if (USE_FAKE_LICENSE_CLIENT === "true") {
  licenseStatusClient = FakeLicenseStatusClient();
} else {
  const LICENSE_STATUS_BASE_URL = process.env.LICENSE_STATUS_BASE_URL || "http://localhost:9000";
  licenseStatusClient = WebserviceLicenseStatusClient(LICENSE_STATUS_BASE_URL);
}

const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE);

const businessNameRepo = PostgresBusinessNameRepo(connection);
const searchBusinessName = searchBusinessNameFactory(businessNameRepo);
const searchLicenseStatus = searchLicenseStatusFactory(licenseStatusClient);

app.use(bodyParser.json({ strict: false }));
app.use("/api", userRouterFactory(userDataClient));
app.use("/api", businessNameRouterFactory(searchBusinessName));
app.use("/api", licenseStatusRouterFactory(searchLicenseStatus));

app.get("/health", (_req, res) => {
  res.send("Alive");
});

export const handler = serverless(app);

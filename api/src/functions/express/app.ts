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
import { LicenseStatusResult, NameAndAddress } from "../../domain/types";
import { updateLicenseStatusFactory } from "../../domain/user/updateLicenseStatusFactory";
import { WebserviceBusinessNameClient } from "../../client/WebserviceBusinessNameClient";

const app = express();
app.use(bodyParser.json());
app.use(cors());

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

const LICENSE_STATUS_BASE_URL = process.env.LICENSE_STATUS_BASE_URL || "http://localhost:9000";
const licenseStatusClient = WebserviceLicenseStatusClient(LICENSE_STATUS_BASE_URL);

const BUSINESS_NAME_BASE_URL = process.env.BUSINESS_NAME_BASE_URL || "http://localhost:9000";
const businessNameClient = WebserviceBusinessNameClient(BUSINESS_NAME_BASE_URL);

const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE);

const searchBusinessName = searchBusinessNameFactory(businessNameClient);
const searchLicenseStatus = searchLicenseStatusFactory(licenseStatusClient);
const updateLicenseStatus = updateLicenseStatusFactory(userDataClient, searchLicenseStatus);

app.use(bodyParser.json({ strict: false }));
app.use("/api", userRouterFactory(userDataClient, updateLicenseStatus));
app.use("/api", businessNameRouterFactory(searchBusinessName));
app.use("/api", licenseStatusRouterFactory(updateLicenseStatus));

app.get("/health", (_req, res) => {
  res.send("Alive");
});

// DELETE ME WHEN THE TESTING WORK IS COMPLETED
app.post("/api/test-license-status", async (req, res) => {
  const nameAndAddress = req.body as NameAndAddress;

  searchLicenseStatus(nameAndAddress, "Home Improvement Contractors")
    .then((result: LicenseStatusResult) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

export const handler = serverless(app);

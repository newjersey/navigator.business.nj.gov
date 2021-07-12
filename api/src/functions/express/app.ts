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
import https from "https";
import { getMyNJCertsFactory } from "../../client/getMyNJCerts";

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

const awsSecretId = process.env.AWS_SECRET_ID || "";
const multilinedKey = (process.env.MYNJ_CERT_KEY || "").replace(/\\n/g, String.fromCharCode(10));
const multilinedCert = (process.env.MYNJ_CERT || "").replace(/\\n/g, String.fromCharCode(10));
const certPassphrase = process.env.MYNJ_CERT_PASSPHRASE || "";

const createAgent = (): Promise<https.Agent> =>
  Promise.resolve(
    new https.Agent({
      cert: multilinedCert,
      key: multilinedKey,
      passphrase: certPassphrase,
    })
  );

const myNJSelfRegClient = MyNJSelfRegClientFactory({
  serviceToken: process.env.MYNJ_SERVICE_TOKEN || "",
  roleName: process.env.MYNJ_ROLE_NAME || "",
  serviceUrl: process.env.MYNJ_SERVICE_URL || "",
  getCertHttpsAgent: multilinedKey ? createAgent : getMyNJCertsFactory(awsSecretId, certPassphrase),
});

app.use(bodyParser.json({ strict: false }));
app.use("/api", userRouterFactory(userDataClient, updateLicenseStatus));
app.use("/api", businessNameRouterFactory(searchBusinessName));
app.use("/api", licenseStatusRouterFactory(updateLicenseStatus));
app.use("/api", selfRegRouterFactory(userDataClient, myNJSelfRegClient));

app.get("/health", (_req, res) => {
  res.send("Alive");
});

export const handler = serverless(app);

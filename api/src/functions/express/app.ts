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
import { GovDeliveryNewsletterClient } from "../../client/GovDeliveryNewsletterClient";
import { selfRegRouterFactory } from "../../api/selfRegRouter";
import { MyNJSelfRegClientFactory } from "../../client/MyNJSelfRegClient";
import { LogWriter } from "@libs/logWriter";
import { FakeTaxFilingClient } from "../../client/FakeTaxFilingClient";
import { addNewsletterFactory } from "src/domain/newsletter/addNewsletterFactory";
import { addToUserTestingFactory } from "../../domain/user-testing/addToUserTestingFactory";
import { AirtableUserTestingClient } from "../../client/AirtableUserTestingClient";

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

const GOV_DELIVERY_BASE_URL =
  process.env.GOV_DELIVERY_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const GOV_DELIVERY_API_KEY = process.env.GOV_DELIVERY_API_KEY || "testkey";
const GOV_DELIVERY_TOPIC = process.env.GOV_DELIVERY_TOPIC || "NJGOV_17";
const GOV_DELIVERY_URL_QUESTION_ID = process.env.GOV_DELIVERY_URL_QUESTION_ID;

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "AIRTABLE_API_KEY";
const AIRTABLE_USER_RESEARCH_BASE_ID = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "TEST_BASE_ID";
const AIRTABLE_BASE_URL =
  process.env.AIRTABLE_BASE_URL ||
  (IS_OFFLINE ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000` : "https://api.airtable.com");

const govDeliveryNewsletterClient = GovDeliveryNewsletterClient({
  baseUrl: GOV_DELIVERY_BASE_URL,
  topic: GOV_DELIVERY_TOPIC,
  apiKey: GOV_DELIVERY_API_KEY,
  logWriter: logger,
  siteUrl: "navigator.business.nj.gov",
  urlQuestion: GOV_DELIVERY_URL_QUESTION_ID,
});

const airtableUserTestingClient = AirtableUserTestingClient(
  {
    apiKey: AIRTABLE_API_KEY,
    baseId: AIRTABLE_USER_RESEARCH_BASE_ID,
    baseUrl: AIRTABLE_BASE_URL,
  },
  logger
);

const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE);

const addGovDeliveryNewsletter = addNewsletterFactory(userDataClient, govDeliveryNewsletterClient);
const addToAirtableUserTesting = addToUserTestingFactory(userDataClient, airtableUserTestingClient);
const searchBusinessName = searchBusinessNameFactory(businessNameClient);
const searchLicenseStatus = searchLicenseStatusFactory(licenseStatusClient);
const updateLicenseStatus = updateLicenseStatusFactory(userDataClient, searchLicenseStatus);

const taxFilingClient = FakeTaxFilingClient();

const myNJSelfRegClient = MyNJSelfRegClientFactory(
  {
    serviceToken: process.env.MYNJ_SERVICE_TOKEN || "",
    roleName: process.env.MYNJ_ROLE_NAME || "",
    serviceUrl: process.env.MYNJ_SERVICE_URL || "",
  },
  logger
);

app.use(bodyParser.json({ strict: false }));
app.use(
  "/api",
  userRouterFactory(
    userDataClient,
    updateLicenseStatus,
    taxFilingClient,
    addGovDeliveryNewsletter,
    addToAirtableUserTesting
  )
);
app.use("/api", businessNameRouterFactory(searchBusinessName));
app.use("/api", licenseStatusRouterFactory(updateLicenseStatus));
app.use("/api", selfRegRouterFactory(userDataClient, myNJSelfRegClient));

app.post("/api/mgmt/auth", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    res.status(200).send();
  } else {
    res.status(401).send();
  }
});

app.get("/health", (_req, res) => {
  res.status(500).send("Alive");
});

export const handler = serverless(app);

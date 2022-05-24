import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { LogWriter } from "@libs/logWriter";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import serverless from "serverless-http";
import { externalEndpointRouterFactory } from "src/api/externalEndpointRouter";
import { guestRouterFactory } from "src/api/guestRouter";
import { AirtableFeedbackClient } from "src/client/airtableFeedbackClient";
import { addNewsletterFactory } from "src/domain/newsletter/addNewsletterFactory";
import { formationRouterFactory } from "../../api/formationRouter";
import { licenseStatusRouterFactory } from "../../api/licenseStatusRouter";
import { selfRegRouterFactory } from "../../api/selfRegRouter";
import { userRouterFactory } from "../../api/userRouter";
import { AirtableUserTestingClient } from "../../client/airtableUserTestingClient";
import { ApiBusinessNameClient } from "../../client/apiBusinessNameClient";
import { ApiFormationClient } from "../../client/apiFormationClient";
import { FakeSelfRegClientFactory } from "../../client/fakeSelfRegClient";
import { GovDeliveryNewsletterClient } from "../../client/govDeliveryNewsletterClient";
import { MyNJSelfRegClientFactory } from "../../client/myNjSelfRegClient";
import { WebserviceLicenseStatusClient } from "../../client/webserviceLicenseStatusClient";
import { dynamoDbTranslateConfig, DynamoUserDataClient } from "../../db/dynamoUserDataClient";
import { searchLicenseStatusFactory } from "../../domain/license-status/searchLicenseStatusFactory";
import { addToUserTestingFactory } from "../../domain/user-testing/addToUserTestingFactory";
import { updateLicenseStatusFactory } from "../../domain/user/updateLicenseStatusFactory";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false; // set by serverless-offline
const IS_DOCKER = process.env.IS_DOCKER === "true" || false; // set in docker-compose

const DYNAMO_OFFLINE_PORT = process.env.DYNAMO_PORT || 8000;
let dynamoDb: DynamoDBDocumentClient;
if (IS_OFFLINE) {
  let dynamoDbEndpoint = "localhost";
  if (IS_DOCKER) {
    dynamoDbEndpoint = "dynamodb-local";
  }
  dynamoDb = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: "localhost",
      endpoint: `http://${dynamoDbEndpoint}:${DYNAMO_OFFLINE_PORT}`,
    }),
    dynamoDbTranslateConfig
  );
} else {
  dynamoDb = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: "us-east-1",
    }),
    dynamoDbTranslateConfig
  );
}

const STAGE = process.env.STAGE || "local";
const logger = LogWriter(`NavigatorWebService/${STAGE}`, "SearchApis");

const LICENSE_STATUS_BASE_URL =
  process.env.LICENSE_STATUS_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const licenseStatusClient = WebserviceLicenseStatusClient(LICENSE_STATUS_BASE_URL, logger);

const BUSINESS_NAME_BASE_URL =
  process.env.BUSINESS_NAME_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const businessNameClient = ApiBusinessNameClient(BUSINESS_NAME_BASE_URL, logger);

const GOV_DELIVERY_BASE_URL =
  process.env.GOV_DELIVERY_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const GOV_DELIVERY_API_KEY = process.env.GOV_DELIVERY_API_KEY || "testkey";
const GOV_DELIVERY_TOPIC = process.env.GOV_DELIVERY_TOPIC || "NJGOV_17";
const GOV_DELIVERY_URL_QUESTION_ID = process.env.GOV_DELIVERY_URL_QUESTION_ID;

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "AIRTABLE_API_KEY";
const AIRTABLE_USER_RESEARCH_BASE_ID = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "TEST_BASE_ID";
const AIRTABLE_FEEDBACK_BASE_ID = process.env.AIRTABLE_FEEDBACK_BASE_ID || "TEST_BASE_ID";
const AIRTABLE_BASE_URL =
  process.env.AIRTABLE_BASE_URL ||
  (IS_OFFLINE ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000` : "https://api.airtable.com");

const FORMATION_API_ACCOUNT = process.env.FORMATION_API_ACCOUNT || "";
const FORMATION_API_KEY = process.env.FORMATION_API_KEY || "";
const FORMATION_API_BASE_URL = process.env.FORMATION_API_BASE_URL || "";

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

const airtableFeedbackClient = AirtableFeedbackClient(
  {
    apiKey: AIRTABLE_API_KEY,
    baseId: AIRTABLE_FEEDBACK_BASE_ID,
    baseUrl: AIRTABLE_BASE_URL,
  },
  logger
);

const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE);

const addGovDeliveryNewsletter = addNewsletterFactory(govDeliveryNewsletterClient);
const addToAirtableUserTesting = addToUserTestingFactory(airtableUserTestingClient);
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
const fakeSelfRegClient = FakeSelfRegClientFactory();
const selfRegClient = process.env.USE_FAKE_SELF_REG === "true" ? fakeSelfRegClient : myNJSelfRegClient;

const apiFormationClient = ApiFormationClient(
  {
    account: FORMATION_API_ACCOUNT,
    key: FORMATION_API_KEY,
    baseUrl: FORMATION_API_BASE_URL,
  },
  logger
);

app.use(bodyParser.json({ strict: false }));
app.use("/api", userRouterFactory(userDataClient, updateLicenseStatus));
app.use(
  "/api/external",
  externalEndpointRouterFactory(
    userDataClient,
    addGovDeliveryNewsletter,
    addToAirtableUserTesting,
    airtableFeedbackClient
  )
);
app.use("/api/guest", guestRouterFactory(businessNameClient));
app.use("/api", licenseStatusRouterFactory(updateLicenseStatus));
app.use("/api", selfRegRouterFactory(userDataClient, selfRegClient));
app.use("/api", formationRouterFactory(apiFormationClient, userDataClient));

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

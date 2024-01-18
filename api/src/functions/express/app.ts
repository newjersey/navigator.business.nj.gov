import { elevatorSafetyRouterFactory } from "@api/elevatorSafetyRouter";
import { fireSafetyRouterFactory } from "@api/fireSafetyRouter";
import { formationRouterFactory } from "@api/formationRouter";
import { healthCheckRouterFactory } from "@api/healthCheckRouter";
import { housingRouterFactory } from "@api/housingRouter";
import { licenseStatusRouterFactory } from "@api/licenseStatusRouter";
import { selfRegRouterFactory } from "@api/selfRegRouter";
import { taxDecryptionRouterFactory } from "@api/taxDecryptionRouter";
import { userRouterFactory } from "@api/userRouter";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { AirtableUserTestingClient } from "@client/AirtableUserTestingClient";
import { ApiBusinessNameClient } from "@client/ApiBusinessNameClient";
import { ApiFormationClient } from "@client/ApiFormationClient";
import { DynamicsAccessTokenClient } from "@client/dynamics/DynamicsAccessTokenClient";
import { DynamicsElevatorSafetyClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyClient";
import { DynamicsElevatorSafetyHealthCheckClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyHealthCheckClient";
import { DynamicsElevatorSafetyInspectionClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyInspectionClient";
import { DynamicsFireSafetyClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyClient";
import { DynamicsFireSafetyHealthCheckClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyHealthCheckClient";
import { DynamicsFireSafetyInspectionClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyInspectionClient";
import { DynamicsHousingClient } from "@client/dynamics/housing/DynamicsHousingClient";
import { DynamicsHousingHealthCheckClient } from "@client/dynamics/housing/DynamicsHousingHealthCheckClient";
import { DynamicsHousingPropertyInterestClient } from "@client/dynamics/housing/DynamicsHousingPropertyInterestClient";
import { DynamicsBusinessAddressClient } from "@client/dynamics/license-status/DynamicsBusinessAddressClient";
import { DynamicsBusinessIdsClient } from "@client/dynamics/license-status/DynamicsBusinessIdsClient";
import { DynamicsChecklistItemsClient } from "@client/dynamics/license-status/DynamicsChecklistItemsClient";
import { DynamicsLicenseApplicationIdClient } from "@client/dynamics/license-status/DynamicsLicenseApplicationIdClient";
import { DynamicsLicenseHealthCheckClient } from "@client/dynamics/license-status/DynamicsLicenseHealthCheckClient";
import { DynamicsLicenseStatusClient } from "@client/dynamics/license-status/DynamicsLicenseStatusClient";
import { FakeSelfRegClientFactory } from "@client/fakeSelfRegClient";
import { GovDeliveryNewsletterClient } from "@client/GovDeliveryNewsletterClient";
import { MyNJSelfRegClientFactory } from "@client/MyNjSelfRegClient";
import { WebserviceLicenseStatusClient } from "@client/WebserviceLicenseStatusClient";
import { WebserviceLicenseStatusProcessorClient } from "@client/WebserviceLicenseStatusProcessorClient";
import { dynamoDbTranslateConfig, DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { searchLicenseStatusFactory } from "@domain/license-status/searchLicenseStatusFactory";
import { HealthCheckMethod } from "@domain/types";
import { updateSidebarCards } from "@domain/updateSidebarCards";
import { addToUserTestingFactory } from "@domain/user-testing/addToUserTestingFactory";
import { timeStampBusinessSearch } from "@domain/user/timeStampBusinessSearch";
import { updateLicenseStatusFactory } from "@domain/user/updateLicenseStatusFactory";
import { updateOperatingPhase } from "@domain/user/updateOperatingPhase";
import { setupExpress } from "@libs/express";
import { LogWriter } from "@libs/logWriter";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import { externalEndpointRouterFactory } from "src/api/externalEndpointRouter";
import { guestRouterFactory } from "src/api/guestRouter";
import { taxFilingRouterFactory } from "src/api/taxFilingRouter";
import { ApiTaxFilingClient } from "src/client/ApiTaxFilingClient";
import { AWSEncryptionDecryptionFactory } from "src/client/AwsEncryptionDecryptionFactory";
import { addNewsletterFactory } from "src/domain/newsletter/addNewsletterFactory";
import { taxFilingsInterfaceFactory } from "src/domain/tax-filings/taxFilingsInterfaceFactory";

const app = setupExpress();

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
const logger = LogWriter(`NavigatorWebService/${STAGE}`, "ApiLogs");

const LICENSE_STATUS_BASE_URL =
  process.env.LICENSE_STATUS_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const webServiceLicenseStatusClient = WebserviceLicenseStatusClient(LICENSE_STATUS_BASE_URL, logger);
const webServiceLicenseStatusHealthCheckClient = webServiceLicenseStatusClient.health;
const webserviceLicenseStatusProcessorClient = WebserviceLicenseStatusProcessorClient(
  webServiceLicenseStatusClient
);

const DYNAMICS_LICENSE_STATUS_URL = process.env.DYNAMICS_LICENSE_STATUS_URL || "";

const dynamicsLicenseStatusAccessTokenClient = DynamicsAccessTokenClient(logger, {
  tenantId: process.env.DYNAMICS_LICENSE_STATUS_TENANT_ID || "",
  orgUrl: DYNAMICS_LICENSE_STATUS_URL,
  clientId: process.env.DYNAMICS_LICENSE_STATUS_CLIENT_ID || "",
  clientSecret: process.env.DYNAMICS_LICENSE_STATUS_SECRET || "",
});

const dynamicsBusinessIdClient = DynamicsBusinessIdsClient(logger, DYNAMICS_LICENSE_STATUS_URL);
const dynamicsAddressClient = DynamicsBusinessAddressClient(logger, DYNAMICS_LICENSE_STATUS_URL);
const dynamicsApplicationIdClient = DynamicsLicenseApplicationIdClient(logger, DYNAMICS_LICENSE_STATUS_URL);
const dynamicsCheckListItemsClient = DynamicsChecklistItemsClient(logger, DYNAMICS_LICENSE_STATUS_URL);

const dynamicsLicenseStatusClient = DynamicsLicenseStatusClient(logger, {
  accessTokenClient: dynamicsLicenseStatusAccessTokenClient,
  businessIdClient: dynamicsBusinessIdClient,
  businessAddressClient: dynamicsAddressClient,
  licenseApplicationIdClient: dynamicsApplicationIdClient,
  checklistItemsClient: dynamicsCheckListItemsClient,
});

const dynamicsLicenseHealthCheckClient = DynamicsLicenseHealthCheckClient(logger, {
  accessTokenClient: dynamicsLicenseStatusAccessTokenClient,
  orgUrl: DYNAMICS_LICENSE_STATUS_URL,
});

const DYNAMICS_FIRE_SAFETY_URL = process.env.DYNAMICS_FIRE_SAFETY_URL || "";

const dynamicsFireSafetyAccessTokenClient = DynamicsAccessTokenClient(logger, {
  tenantId: process.env.DYNAMICS_FIRE_SAFETY_TENANT_ID || "",
  orgUrl: DYNAMICS_FIRE_SAFETY_URL,
  clientId: process.env.DYNAMICS_FIRE_SAFETY_CLIENT_ID || "",
  clientSecret: process.env.DYNAMICS_FIRE_SAFETY_SECRET || "",
});

const dynamicsFireSafetyInspectionClient = DynamicsFireSafetyInspectionClient(
  logger,
  DYNAMICS_FIRE_SAFETY_URL
);
const dynamicsFireSafetyClient = DynamicsFireSafetyClient(logger, {
  accessTokenClient: dynamicsFireSafetyAccessTokenClient,
  fireSafetyInspectionClient: dynamicsFireSafetyInspectionClient,
});

const DYNAMICS_HOUSING_URL = process.env.DYNAMICS_HOUSING_URL || "";

const dynamicsHousingAccessTokenClient = DynamicsAccessTokenClient(logger, {
  tenantId: process.env.DYNAMICS_HOUSING_TENANT_ID || "",
  orgUrl: DYNAMICS_HOUSING_URL,
  clientId: process.env.DYNAMICS_HOUSING_CLIENT_ID || "",
  clientSecret: process.env.DYNAMICS_HOUSING_SECRET || "",
});
const dynamicsHousingPropertyInterestClient = DynamicsHousingPropertyInterestClient(
  logger,
  DYNAMICS_HOUSING_URL
);

const dynamicsHousingClient = DynamicsHousingClient(logger, {
  accessTokenClient: dynamicsHousingAccessTokenClient,
  housingPropertyInterestClient: dynamicsHousingPropertyInterestClient,
});

const DYNAMICS_ELEVATOR_SAFETY_URL = process.env.DYNAMICS_ELEVATOR_SAFETY_URL || "";

const dynamicsElevatorSafetyAccessTokenClient = DynamicsAccessTokenClient(logger, {
  tenantId: process.env.DYNAMICS_ELEVATOR_SAFETY_TENANT_ID || "",
  orgUrl: DYNAMICS_ELEVATOR_SAFETY_URL,
  clientId: process.env.DYNAMICS_ELEVATOR_SAFETY_CLIENT_ID || "",
  clientSecret: process.env.DYNAMICS_ELEVATOR_SAFETY_SECRET || "",
});

const dynamicsElevatorSafetyInspectionClient = DynamicsElevatorSafetyInspectionClient(
  logger,
  DYNAMICS_ELEVATOR_SAFETY_URL
);

const dynamicsElevatorSafetyClient = DynamicsElevatorSafetyClient(logger, {
  accessTokenClient: dynamicsElevatorSafetyAccessTokenClient,
  elevatorSafetyInspectionClient: dynamicsElevatorSafetyInspectionClient,
});
const dynamicsElevatorSafetyHealthCheckClient = DynamicsElevatorSafetyHealthCheckClient(logger, {
  accessTokenClient: dynamicsElevatorSafetyAccessTokenClient,
  orgUrl: DYNAMICS_ELEVATOR_SAFETY_URL,
});
const dynamicsFireSafetyHealthCheckClient = DynamicsFireSafetyHealthCheckClient(logger, {
  accessTokenClient: dynamicsFireSafetyAccessTokenClient,
  orgUrl: DYNAMICS_FIRE_SAFETY_URL,
});
const dynamicsHousingHealthCheckClient = DynamicsHousingHealthCheckClient(logger, {
  accessTokenClient: dynamicsHousingAccessTokenClient,
  orgUrl: DYNAMICS_HOUSING_URL,
});

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
const AIRTABLE_USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || "Users Dev";
const AIRTABLE_BASE_URL =
  process.env.AIRTABLE_BASE_URL ||
  (IS_OFFLINE ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000` : "https://api.airtable.com");

const FORMATION_API_ACCOUNT = process.env.FORMATION_API_ACCOUNT || "";
const FORMATION_API_KEY = process.env.FORMATION_API_KEY || "";
const FORMATION_API_BASE_URL =
  process.env.FORMATION_API_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;

const GOV2GO_REGISTRATION_API_KEY = process.env.GOV2GO_REGISTRATION_API_KEY || "";
const GOV2GO_REGISTRATION_BASE_URL = process.env.GOV2GO_REGISTRATION_BASE_URL || "";

const AWS_CRYPTO_KEY = process.env.AWS_CRYPTO_KEY || "";
const AWS_CRYPTO_CONTEXT_STAGE = process.env.AWS_CRYPTO_CONTEXT_STAGE || "";
const AWS_CRYPTO_CONTEXT_PURPOSE = process.env.AWS_CRYPTO_CONTEXT_PURPOSE || "";
const AWS_CRYPTO_CONTEXT_ORIGIN = process.env.AWS_CRYPTO_CONTEXT_ORIGIN || "";

const AWSEncryptionDecryptionClient = AWSEncryptionDecryptionFactory(AWS_CRYPTO_KEY, {
  stage: AWS_CRYPTO_CONTEXT_STAGE,
  purpose: AWS_CRYPTO_CONTEXT_PURPOSE,
  origin: AWS_CRYPTO_CONTEXT_ORIGIN,
});

const taxFilingClient = ApiTaxFilingClient(
  {
    baseUrl: GOV2GO_REGISTRATION_BASE_URL,
    apiKey: GOV2GO_REGISTRATION_API_KEY,
  },
  logger
);
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
    usersTableName: AIRTABLE_USERS_TABLE,
  },
  logger
);

const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE);

const taxFilingInterface = taxFilingsInterfaceFactory(taxFilingClient);

const addGovDeliveryNewsletter = addNewsletterFactory(govDeliveryNewsletterClient);
const addToAirtableUserTesting = addToUserTestingFactory(airtableUserTestingClient);
const searchLicenseStatus = searchLicenseStatusFactory(
  webserviceLicenseStatusProcessorClient,
  dynamicsLicenseStatusClient
);
const updateLicenseStatus = updateLicenseStatusFactory(searchLicenseStatus);
const timeStampToBusinessSearch = timeStampBusinessSearch(businessNameClient);

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
const shouldSaveDocuments = !(process.env.SKIP_SAVE_DOCUMENTS_TO_S3 === "true");

app.use(bodyParser.json({ strict: false }));
app.use(
  "/api",
  userRouterFactory(
    userDataClient,
    updateLicenseStatus,
    updateOperatingPhase,
    updateSidebarCards,
    AWSEncryptionDecryptionClient,
    timeStampToBusinessSearch
  )
);
app.use(
  "/api/external",
  externalEndpointRouterFactory(userDataClient, addGovDeliveryNewsletter, addToAirtableUserTesting)
);
app.use("/api/guest", guestRouterFactory(timeStampToBusinessSearch));
app.use("/api", licenseStatusRouterFactory(updateLicenseStatus, userDataClient));
app.use("/api", elevatorSafetyRouterFactory(dynamicsElevatorSafetyClient));
app.use("/api", fireSafetyRouterFactory(dynamicsFireSafetyClient));
app.use("/api", housingRouterFactory(dynamicsHousingClient));
app.use("/api", selfRegRouterFactory(userDataClient, selfRegClient));
app.use("/api", formationRouterFactory(apiFormationClient, userDataClient, { shouldSaveDocuments }));
app.use(
  "/api/taxFilings",
  taxFilingRouterFactory(userDataClient, taxFilingInterface, AWSEncryptionDecryptionClient)
);
app.use("/api", taxDecryptionRouterFactory(AWSEncryptionDecryptionClient));

app.use(
  "/health",
  healthCheckRouterFactory(
    new Map<string, HealthCheckMethod>([
      ["dynamics/elevator", dynamicsElevatorSafetyHealthCheckClient],
      ["dynamics/fire-safety", dynamicsFireSafetyHealthCheckClient],
      ["dynamics/housing", dynamicsHousingHealthCheckClient],
      ["dynamics/license-status", dynamicsLicenseHealthCheckClient],
      ["webservice/license-status", webServiceLicenseStatusHealthCheckClient],
    ])
  )
);

app.post("/api/mgmt/auth", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    logger.LogInfo(`MgmtAuth - Id:${logger.GetId()} - MATCH`);
    res.status(200).send();
  } else {
    logger.LogInfo(
      `MgmtAuth - Id:${logger.GetId()} - FAILED-AUTH request: '${req.body.password}' password: '${
        process.env.ADMIN_PASSWORD
      }'`
    );
    res.status(401).send();
  }
});

export const handler = serverless(app);

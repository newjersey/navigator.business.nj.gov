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
import { DynamicsElevatorSafetyHealthCheckClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyHealthCheckClient";
import { DynamicsElevatorSafetyInspectionClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyInspectionClient";
import { DynamicsElevatorSafetyInspectionStatusClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyInspectionStatusClient";
import { DynamicsElevatorSafetyRegistrationClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyRegistrationClient";
import { DynamicsElevatorSafetyRegistrationStatusClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyRegistrationStatusClient";
import { DynamicsElevatorSafetyViolationsClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyViolationsClient";
import { DynamicsElevatorSafetyViolationsStatusClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyViolationsStatusClient";
import { DynamicsFireSafetyClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyClient";
import { DynamicsFireSafetyHealthCheckClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyHealthCheckClient";
import { DynamicsFireSafetyInspectionClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyInspectionClient";
import { DynamicsHousingClient } from "@client/dynamics/housing/DynamicsHousingClient";
import { DynamicsHousingHealthCheckClient } from "@client/dynamics/housing/DynamicsHousingHealthCheckClient";
import { DynamicsHousingPropertyInterestClient } from "@client/dynamics/housing/DynamicsHousingPropertyInterestClient";
import { DynamicsHousingRegistrationClient } from "@client/dynamics/housing/DynamicsHousingRegistrationClient";
import { DynamicsHousingRegistrationStatusClient } from "@client/dynamics/housing/DynamicsHousingRegistrationStatusClient";
import { RegulatedBusinessDynamicsBusinessAddressesClient } from "@client/dynamics/license-status/RegulatedBusinessDynamicsBusinessAddressesClient";
import { RegulatedBusinessDynamicsBusinessIdsAndNamesClient } from "@client/dynamics/license-status/RegulatedBusinessDynamicsBusinessIdsAndNamesClient";
import { RegulatedBusinessDynamicsChecklistItemsClient } from "@client/dynamics/license-status/RegulatedBusinessDynamicsChecklistItemsClient";
import { RegulatedBusinessDynamicsLicenseApplicationIdsClient } from "@client/dynamics/license-status/RegulatedBusinessDynamicsLicenseApplicationIdsClient";
import { RegulatedBusinessDynamicsLicenseHealthCheckClient } from "@client/dynamics/license-status/RegulatedBusinessDynamicsLicenseHealthCheckClient";
import { RegulatedBusinessDynamicsLicenseStatusClient } from "@client/dynamics/license-status/RegulatedBusinessDynamicsLicenseStatusClient";
import { FakeSelfRegClientFactory } from "@client/fakeSelfRegClient";
import { GovDeliveryNewsletterClient } from "@client/GovDeliveryNewsletterClient";
import { MyNJSelfRegClientFactory } from "@client/MyNjSelfRegClient";
import { WebserviceLicenseStatusClient } from "@client/WebserviceLicenseStatusClient";
import { WebserviceLicenseStatusProcessorClient } from "@client/WebserviceLicenseStatusProcessorClient";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { HealthCheckMethod } from "@domain/types";
import { updateSidebarCards } from "@domain/updateSidebarCards";
import { addToUserTestingFactory } from "@domain/user-testing/addToUserTestingFactory";
import { timeStampBusinessSearch } from "@domain/user/timeStampBusinessSearch";
import { updateLicenseStatusFactory } from "@domain/user/updateLicenseStatusFactory";
import { updateOperatingPhase } from "@domain/user/updateOperatingPhase";
import { setupExpress } from "@libs/express";
import { LogWriter } from "@libs/logWriter";
import bodyParser from "body-parser";
import { StatusCodes } from "http-status-codes";
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
const dataLogger = LogWriter(`aws/${STAGE}`, "DataMigrationLogs");

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

const rgbBusinessIdClient = RegulatedBusinessDynamicsBusinessIdsAndNamesClient(
  logger,
  DYNAMICS_LICENSE_STATUS_URL
);
const rgbAddressClient = RegulatedBusinessDynamicsBusinessAddressesClient(
  logger,
  DYNAMICS_LICENSE_STATUS_URL
);
const rgbApplicationIdClient = RegulatedBusinessDynamicsLicenseApplicationIdsClient(
  logger,
  DYNAMICS_LICENSE_STATUS_URL
);
const rgbCheckListItemsClient = RegulatedBusinessDynamicsChecklistItemsClient(
  logger,
  DYNAMICS_LICENSE_STATUS_URL
);

const rgbLicenseStatusClient = RegulatedBusinessDynamicsLicenseStatusClient({
  dynamicsAccessTokenClient: dynamicsLicenseStatusAccessTokenClient,
  rgbBusinessIdsAndNamesClient: rgbBusinessIdClient,
  rgbBusinessAddressesClient: rgbAddressClient,
  rgbLicenseApplicationIdsClient: rgbApplicationIdClient,
  rgbChecklistItemsClient: rgbCheckListItemsClient,
});

const rgbDynamicsLicenseHealthCheckClient = RegulatedBusinessDynamicsLicenseHealthCheckClient(logger, {
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
const dynamicsElevatorSafetyRegistrationClient = DynamicsElevatorSafetyRegistrationClient(
  logger,
  DYNAMICS_ELEVATOR_SAFETY_URL
);

const dynamicsElevatorSafetyViolationsClient = DynamicsElevatorSafetyViolationsClient(
  logger,
  DYNAMICS_ELEVATOR_SAFETY_URL
);

const dynamicsElevatorSafetyInspectionStatusClient = DynamicsElevatorSafetyInspectionStatusClient(logger, {
  accessTokenClient: dynamicsElevatorSafetyAccessTokenClient,
  elevatorSafetyInspectionClient: dynamicsElevatorSafetyInspectionClient,
});
const dynamicsElevatorSafetyRegistrationStatusClient = DynamicsElevatorSafetyRegistrationStatusClient(
  logger,
  {
    accessTokenClient: dynamicsElevatorSafetyAccessTokenClient,
    elevatorRegistrationClient: dynamicsElevatorSafetyRegistrationClient,
    housingAccessTokenClient: dynamicsHousingAccessTokenClient,
    housingPropertyInterestClient: dynamicsHousingPropertyInterestClient,
  }
);
const dynamicsElevatorSafetyViolationsStatusClient = DynamicsElevatorSafetyViolationsStatusClient({
  accessTokenClient: dynamicsElevatorSafetyAccessTokenClient,
  elevatorSafetyViolationsClient: dynamicsElevatorSafetyViolationsClient,
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
const dynamicsHousingRegistrationClient = DynamicsHousingRegistrationClient(logger, DYNAMICS_HOUSING_URL);
const dynamicsHousingRegistrationStatusClient = DynamicsHousingRegistrationStatusClient({
  accessTokenClient: dynamicsHousingAccessTokenClient,
  housingHousingRegistrationClient: dynamicsHousingRegistrationClient,
  housingPropertyInterestClient: dynamicsHousingPropertyInterestClient,
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
const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, dataLogger);

const taxFilingInterface = taxFilingsInterfaceFactory(taxFilingClient);

const addGovDeliveryNewsletter = addNewsletterFactory(govDeliveryNewsletterClient);
const addToAirtableUserTesting = addToUserTestingFactory(airtableUserTestingClient);

const updateLicenseStatus = updateLicenseStatusFactory(
  webserviceLicenseStatusProcessorClient,
  rgbLicenseStatusClient
);
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

const formationHealthCheckClient = apiFormationClient.health;

const shouldSaveDocuments = !(process.env.SKIP_SAVE_DOCUMENTS_TO_S3 === "true");

app.use(bodyParser.json({ strict: false }));

app.use(
  "/api",
  userRouterFactory(
    userDataClient,
    updateLicenseStatus,
    updateSidebarCards,
    updateOperatingPhase,
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
app.use(
  "/api",
  elevatorSafetyRouterFactory(
    dynamicsElevatorSafetyInspectionStatusClient,
    dynamicsElevatorSafetyRegistrationStatusClient,
    dynamicsElevatorSafetyViolationsStatusClient
  )
);
app.use("/api", fireSafetyRouterFactory(dynamicsFireSafetyClient));
app.use("/api", housingRouterFactory(dynamicsHousingClient, dynamicsHousingRegistrationStatusClient));
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
      ["rgbDynamics/license-status", rgbDynamicsLicenseHealthCheckClient],
      ["webservice/license-status", webServiceLicenseStatusHealthCheckClient],
      ["webservice/formation", formationHealthCheckClient],
    ])
  )
);

app.post("/api/mgmt/auth", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    logger.LogInfo(`MgmtAuth - Id:${logger.GetId()} - MATCH`);
    res.status(StatusCodes.OK).send();
  } else {
    logger.LogInfo(
      `MgmtAuth - Id:${logger.GetId()} - FAILED-AUTH request: '${req.body.password}' password: '${
        process.env.ADMIN_PASSWORD
      }'`
    );
    res.status(StatusCodes.UNAUTHORIZED).send();
  }
});

export const handler = serverless(app);

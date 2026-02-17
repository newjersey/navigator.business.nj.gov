import { cigaretteLicenseRouterFactory } from "@api/cigaretteLicenseRouter";
import { crtkEmailRouter } from "@api/crtkEmailRouter";
import { crtkLookupRouterFactory } from "@api/crtkRouter";
import { decryptionRouterFactory } from "@api/decryptionRouter";
import { elevatorSafetyRouterFactory } from "@api/elevatorSafetyRouter";
import { emergencyTripPermitRouterFactory } from "@api/emergencyTripPermitRouter";
import { employerRatesRouterFactory } from "@api/employerRatesRouter";
import { environmentPermitEmailRouter } from "@api/environmentPermitEmailRouter";
import { fireSafetyRouterFactory } from "@api/fireSafetyRouter";
import { formationRouterFactory } from "@api/formationRouter";
import { healthCheckRouterFactory } from "@api/healthCheckRouter";
import { housingRouterFactory } from "@api/housingRouter";
import { licenseStatusRouterFactory } from "@api/licenseStatusRouter";
import { selfRegRouterFactory } from "@api/selfRegRouter";
import { taxClearanceCertificateRouterFactory } from "@api/taxClearanceCertificateRouter";
import { userRouterFactory } from "@api/userRouter";
import { xrayRegistrationRouterFactory } from "@api/xrayRegistrationRouter";
import { AbcEmergencyTripPermitClient } from "@client/AbcEmergencyTripPermitClient";
import { AirtableUserTestingClient } from "@client/AirtableUserTestingClient";
import { ApiBusinessNameClient } from "@client/ApiBusinessNameClient";
import { ApiCigaretteLicenseClient } from "@client/ApiCigaretteLicenseClient";
import { ApiEnvPermitEmailClient } from "@client/ApiEnvPermitEmailClient";
import { ApiFormationClient } from "@client/ApiFormationClient";
import { ApiTaxClearanceCertificateClient } from "@client/ApiTaxClearanceCertificateClient";
import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { AwsMessagingServiceClient } from "@client/AwsMessagingServiceClient";
import { CigaretteLicenseEmailClient } from "@client/CigaretteLicenseEmailClient";
import { CrtkEmailClient } from "@client/CrtkEmailClient";
import { CrtkLookupClient } from "@client/dep/crtk/CrtkLookupClient";
import { CrtkSearchClient } from "@client/dep/crtk/CrtkSearchClient";
import { XrayRegistrationHealthCheckClient } from "@client/dep/xray/XrayRegistrationHealthCheckClient";
import { XrayRegistrationLookupClient } from "@client/dep/xray/XrayRegistrationLookupClient";
import { XrayRegistrationSearchClient } from "@client/dep/xray/XrayRegistrationSearchClient";
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
import { MockCryptoClient } from "@client/MockCryptoClient";
import { MyNJSelfRegClientFactory } from "@client/MyNjSelfRegClient";
import { WebserviceEmployerRatesClient } from "@client/webservice/WebserviceEmployerRatesClient";
import { WebserviceLicenseStatusClient } from "@client/webservice/WebserviceLicenseStatusClient";
import { WebserviceLicenseStatusProcessorClient } from "@client/webservice/WebserviceLicenseStatusProcessorClient";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoDataClient } from "@db/DynamoDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { HealthCheckMethod } from "@domain/types";
import { updateSidebarCards } from "@domain/updateSidebarCards";
import { addToUserTestingFactory } from "@domain/user-testing/addToUserTestingFactory";
import { timeStampBusinessSearch } from "@domain/user/timeStampBusinessSearch";
import { updateCrtkStatusFactory } from "@domain/user/updateCrtkStatusFactory";
import { updateLicenseStatusFactory } from "@domain/user/updateLicenseStatusFactory";
import { updateOperatingPhase } from "@domain/user/updateOperatingPhase";
import { updateXrayRegistrationStatusFactory } from "@domain/user/updateXrayRegistrationStatusFactory";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE,
  AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT,
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  AWS_CRYPTO_TAX_ID_HASHING_KEY,
  BUSINESSES_TABLE,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  STAGE,
} from "@functions/config";
import { setupExpress } from "@libs/express";
import { ConsoleLogWriter, LogWriter } from "@libs/logWriter";
import { isKillSwitchOn } from "@libs/ssmUtils";
import bodyParser from "body-parser";
import { StatusCodes } from "http-status-codes";
import serverless from "serverless-http";
import { externalEndpointRouterFactory } from "src/api/externalEndpointRouter";
import { guestRouterFactory } from "src/api/guestRouter";
import { taxFilingRouterFactory } from "src/api/taxFilingRouter";
import { ApiTaxFilingClient } from "src/client/ApiTaxFilingClient";
import { addNewsletterFactory } from "src/domain/newsletter/addNewsletterFactory";
import { taxFilingsInterfaceFactory } from "src/domain/tax-filings/taxFilingsInterfaceFactory";

const app = setupExpress();

const isLocal = STAGE === "local";

const logger = isLocal ? ConsoleLogWriter : LogWriter(`NavigatorWebService/${STAGE}`, "ApiLogs");
const dataLogger = isLocal
  ? ConsoleLogWriter
  : LogWriter(`NavigatorDBClient/${STAGE}`, "DataMigrationLogs");

const XRAY_REGISTRATION_STATUS_BASE_URL =
  process.env.XRAY_REGISTRATION_STATUS_BASE_URL || "http://localhost:9000";

const LICENSE_STATUS_BASE_URL =
  process.env.LICENSE_STATUS_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const webServiceLicenseStatusClient = WebserviceLicenseStatusClient(
  LICENSE_STATUS_BASE_URL,
  logger,
);
const webServiceLicenseStatusHealthCheckClient = webServiceLicenseStatusClient.health;
const webserviceLicenseStatusProcessorClient = WebserviceLicenseStatusProcessorClient(
  webServiceLicenseStatusClient,
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
  DYNAMICS_LICENSE_STATUS_URL,
);
const rgbAddressClient = RegulatedBusinessDynamicsBusinessAddressesClient(
  logger,
  DYNAMICS_LICENSE_STATUS_URL,
);
const rgbApplicationIdClient = RegulatedBusinessDynamicsLicenseApplicationIdsClient(
  logger,
  DYNAMICS_LICENSE_STATUS_URL,
);
const rgbCheckListItemsClient = RegulatedBusinessDynamicsChecklistItemsClient(
  logger,
  DYNAMICS_LICENSE_STATUS_URL,
);

const rgbLicenseStatusClient = RegulatedBusinessDynamicsLicenseStatusClient({
  dynamicsAccessTokenClient: dynamicsLicenseStatusAccessTokenClient,
  rgbBusinessIdsAndNamesClient: rgbBusinessIdClient,
  rgbBusinessAddressesClient: rgbAddressClient,
  rgbLicenseApplicationIdsClient: rgbApplicationIdClient,
  rgbChecklistItemsClient: rgbCheckListItemsClient,
});

const rgbDynamicsLicenseHealthCheckClient = RegulatedBusinessDynamicsLicenseHealthCheckClient(
  logger,
  {
    accessTokenClient: dynamicsLicenseStatusAccessTokenClient,
    orgUrl: DYNAMICS_LICENSE_STATUS_URL,
  },
);

const DYNAMICS_FIRE_SAFETY_URL = process.env.DYNAMICS_FIRE_SAFETY_URL || "";

const dynamicsFireSafetyAccessTokenClient = DynamicsAccessTokenClient(logger, {
  tenantId: process.env.DYNAMICS_FIRE_SAFETY_TENANT_ID || "",
  orgUrl: DYNAMICS_FIRE_SAFETY_URL,
  clientId: process.env.DYNAMICS_FIRE_SAFETY_CLIENT_ID || "",
  clientSecret: process.env.DYNAMICS_FIRE_SAFETY_SECRET || "",
});

const dynamicsFireSafetyInspectionClient = DynamicsFireSafetyInspectionClient(
  logger,
  DYNAMICS_FIRE_SAFETY_URL,
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
  DYNAMICS_HOUSING_URL,
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
  DYNAMICS_ELEVATOR_SAFETY_URL,
);
const dynamicsElevatorSafetyRegistrationClient = DynamicsElevatorSafetyRegistrationClient(
  logger,
  DYNAMICS_ELEVATOR_SAFETY_URL,
);

const dynamicsElevatorSafetyViolationsClient = DynamicsElevatorSafetyViolationsClient(
  logger,
  DYNAMICS_ELEVATOR_SAFETY_URL,
);

const dynamicsElevatorSafetyInspectionStatusClient = DynamicsElevatorSafetyInspectionStatusClient(
  logger,
  {
    accessTokenClient: dynamicsElevatorSafetyAccessTokenClient,
    elevatorSafetyInspectionClient: dynamicsElevatorSafetyInspectionClient,
  },
);
const dynamicsElevatorSafetyRegistrationStatusClient =
  DynamicsElevatorSafetyRegistrationStatusClient(logger, {
    accessTokenClient: dynamicsElevatorSafetyAccessTokenClient,
    elevatorRegistrationClient: dynamicsElevatorSafetyRegistrationClient,
    housingAccessTokenClient: dynamicsHousingAccessTokenClient,
    housingPropertyInterestClient: dynamicsHousingPropertyInterestClient,
  });
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
const dynamicsHousingRegistrationClient = DynamicsHousingRegistrationClient(
  logger,
  DYNAMICS_HOUSING_URL,
);
const dynamicsHousingRegistrationStatusClient = DynamicsHousingRegistrationStatusClient({
  accessTokenClient: dynamicsHousingAccessTokenClient,
  housingHousingRegistrationClient: dynamicsHousingRegistrationClient,
  housingPropertyInterestClient: dynamicsHousingPropertyInterestClient,
});

const ORG_URL =
  process.env.USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH?.toLowerCase() === "true"
    ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`
    : process.env.TAX_CLEARANCE_CERTIFICATE_URL;

const taxClearanceCertificateClient = ApiTaxClearanceCertificateClient(logger, {
  orgUrl: ORG_URL!,
  userName: process.env.TAX_CLEARANCE_CERTIFICATE_USER_NAME || "",
  password: process.env.TAX_CLEARANCE_CERTIFICATE_PASSWORD || "",
});
const taxClearanceHealthCheckClient = taxClearanceCertificateClient.health;

const cigaretteLicenseEmailClient = CigaretteLicenseEmailClient(logger);
const cigaretteLicenseClient = ApiCigaretteLicenseClient(cigaretteLicenseEmailClient, logger);
const cigaretteLicenseHealthCheckClient = cigaretteLicenseClient.health;

const BUSINESS_NAME_BASE_URL =
  process.env.USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH?.toLowerCase() === "true"
    ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`
    : process.env.BUSINESS_NAME_BASE_URL;
const businessNameClient = ApiBusinessNameClient(BUSINESS_NAME_BASE_URL!, logger);

const GOV_DELIVERY_BASE_URL =
  process.env.GOV_DELIVERY_BASE_URL || `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`;
const GOV_DELIVERY_API_KEY = process.env.GOV_DELIVERY_API_KEY || "testkey";
const GOV_DELIVERY_TOPIC = process.env.GOV_DELIVERY_TOPIC || "";
const GOV_DELIVERY_URL_QUESTION_ID = process.env.GOV_DELIVERY_URL_QUESTION_ID;

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "AIRTABLE_API_KEY";
const AIRTABLE_USER_RESEARCH_BASE_ID = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "TEST_BASE_ID";
const AIRTABLE_USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || "Users Dev";
const AIRTABLE_BASE_URL =
  process.env.AIRTABLE_BASE_URL ||
  (STAGE === "local"
    ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`
    : "https://api.airtable.com");

const FORMATION_API_ACCOUNT = process.env.FORMATION_API_ACCOUNT || "";
const FORMATION_API_KEY = process.env.FORMATION_API_KEY || "";
const FORMATION_API_BASE_URL =
  process.env.USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH?.toLowerCase() === "true"
    ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`
    : process.env.FORMATION_API_BASE_URL;

const GOV2GO_REGISTRATION_API_KEY = process.env.GOV2GO_REGISTRATION_API_KEY || "";
const GOV2GO_REGISTRATION_BASE_URL = isLocal
  ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`
  : process.env.GOV2GO_REGISTRATION_BASE_URL || "";

const EmployerRatesClient = WebserviceEmployerRatesClient(logger);

const ABC_ETP_API_ACCOUNT = process.env.ABC_ETP_API_ACCOUNT || "";
const ABC_ETP_API_KEY = process.env.ABC_ETP_API_KEY || "";
const ABC_ETP_API_BASE_URL = process.env.ABC_ETP_API_BASE_URL || "";

const AWSTaxIDEncryptionClient = isLocal
  ? new MockCryptoClient()
  : AWSCryptoFactory(AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY, {
      stage: AWS_CRYPTO_CONTEXT_STAGE,
      purpose: AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
      origin: AWS_CRYPTO_CONTEXT_ORIGIN,
    });

const AWSTaxIDHashingClient = isLocal
  ? new MockCryptoClient()
  : AWSCryptoFactory(
      AWS_CRYPTO_TAX_ID_HASHING_KEY,
      {
        stage: AWS_CRYPTO_CONTEXT_STAGE,
        purpose: AWS_CRYPTO_CONTEXT_TAX_ID_HASHING_PURPOSE,
        origin: AWS_CRYPTO_CONTEXT_ORIGIN,
      },
      AWS_CRYPTO_TAX_ID_ENCRYPTED_HASHING_SALT,
    );

const taxFilingClient = ApiTaxFilingClient(
  {
    baseUrl: GOV2GO_REGISTRATION_BASE_URL,
    apiKey: GOV2GO_REGISTRATION_API_KEY,
  },
  logger,
);
const govDeliveryNewsletterClient = GovDeliveryNewsletterClient({
  baseUrl: GOV_DELIVERY_BASE_URL,
  topic: GOV_DELIVERY_TOPIC,
  apiKey: GOV_DELIVERY_API_KEY,
  logWriter: logger,
  // TODO: This is no longer our domain. Can we change this? Make it a variable.
  siteUrl: "navigator.business.nj.gov",
  urlQuestion: GOV_DELIVERY_URL_QUESTION_ID, // TODO: What is this? Currently undefined.
});

const airtableUserTestingClient = AirtableUserTestingClient(
  {
    apiKey: AIRTABLE_API_KEY,
    baseId: AIRTABLE_USER_RESEARCH_BASE_ID,
    baseUrl: AIRTABLE_BASE_URL,
    usersTableName: AIRTABLE_USERS_TABLE,
  },
  logger,
);
const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
const dynamoDb = createDynamoDbClient(IS_DOCKER, DYNAMO_OFFLINE_PORT);
const userDataClient = DynamoUserDataClient(
  dynamoDb,
  AWSTaxIDEncryptionClient,
  USERS_TABLE,
  dataLogger,
);
const businessesDataClient = DynamoBusinessDataClient(dynamoDb, BUSINESSES_TABLE, dataLogger);
const dynamoDataClient = DynamoDataClient(
  userDataClient,
  businessesDataClient,
  dataLogger,
  isKillSwitchOn,
);

const taxFilingInterface = taxFilingsInterfaceFactory(taxFilingClient);

const addGovDeliveryNewsletter = addNewsletterFactory(govDeliveryNewsletterClient);
const addToAirtableUserTesting = addToUserTestingFactory(airtableUserTestingClient);

const updateLicenseStatus = updateLicenseStatusFactory(
  webserviceLicenseStatusProcessorClient,
  rgbLicenseStatusClient,
);

const xrayRegistrationHealthCheckClient = XrayRegistrationHealthCheckClient(logger, {
  orgUrl: XRAY_REGISTRATION_STATUS_BASE_URL,
});

const xrayRegistrationSearch = XrayRegistrationSearchClient(
  logger,
  XRAY_REGISTRATION_STATUS_BASE_URL,
);

const xrayRegistrationLookup = XrayRegistrationLookupClient(xrayRegistrationSearch, logger);

const environmentPermitEmailClient = ApiEnvPermitEmailClient(logger);

const updateXrayStatus = updateXrayRegistrationStatusFactory(xrayRegistrationLookup);

const crtkSearch = CrtkSearchClient(logger);

const crtkLookup = CrtkLookupClient(crtkSearch, logger);

const crtkEmailClient = CrtkEmailClient(logger);

const updateCrtkStatus = updateCrtkStatusFactory(crtkLookup);

const timeStampToBusinessSearch = timeStampBusinessSearch(businessNameClient);

const myNJSelfRegClient = MyNJSelfRegClientFactory(
  {
    serviceToken: process.env.MYNJ_SERVICE_TOKEN || "",
    roleName: process.env.MYNJ_ROLE_NAME || "",
    serviceUrl: process.env.MYNJ_SERVICE_URL || "",
  },
  logger,
);
const fakeSelfRegClient = FakeSelfRegClientFactory();
const selfRegClient =
  process.env.USE_FAKE_SELF_REG === "true" ? fakeSelfRegClient : myNJSelfRegClient;

const apiFormationClient = ApiFormationClient(
  {
    account: FORMATION_API_ACCOUNT,
    key: FORMATION_API_KEY,
    baseUrl: FORMATION_API_BASE_URL!,
  },
  logger,
);

const formationHealthCheckClient = apiFormationClient.health;

const shouldSaveDocuments = !(process.env.SKIP_SAVE_DOCUMENTS_TO_S3 === "true");

const emergencyTripPermitClient = AbcEmergencyTripPermitClient(
  {
    account: ABC_ETP_API_ACCOUNT,
    key: ABC_ETP_API_KEY,
    baseUrl: ABC_ETP_API_BASE_URL,
  },
  logger,
);

app.use(bodyParser.json({ strict: false }));

app.use(
  "/api",
  userRouterFactory(
    dynamoDataClient,
    updateLicenseStatus,
    updateXrayStatus,
    updateSidebarCards,
    updateOperatingPhase,
    AWSTaxIDEncryptionClient,
    AWSTaxIDHashingClient,
    timeStampToBusinessSearch,
    logger,
  ),
);

app.use(
  "/api/external",
  externalEndpointRouterFactory(
    dynamoDataClient,
    addGovDeliveryNewsletter,
    addToAirtableUserTesting,
    logger,
  ),
);
app.use("/api/guest", guestRouterFactory(timeStampToBusinessSearch, logger));
app.use("/api", licenseStatusRouterFactory(updateLicenseStatus, dynamoDataClient, logger));
app.use(
  "/api",
  elevatorSafetyRouterFactory(
    dynamicsElevatorSafetyInspectionStatusClient,
    dynamicsElevatorSafetyRegistrationStatusClient,
    dynamicsElevatorSafetyViolationsStatusClient,
    logger,
  ),
);
app.use(
  "/api",
  taxClearanceCertificateRouterFactory(
    taxClearanceCertificateClient,
    AWSTaxIDEncryptionClient,
    dynamoDataClient,
    logger,
  ),
);
app.use(
  "/api",
  cigaretteLicenseRouterFactory(
    cigaretteLicenseClient,
    AWSTaxIDEncryptionClient,
    dynamoDataClient,
    logger,
  ),
);
app.use("/api", fireSafetyRouterFactory(dynamicsFireSafetyClient, logger));
app.use(
  "/api",
  housingRouterFactory(dynamicsHousingClient, dynamicsHousingRegistrationStatusClient, logger),
);

const messagingServiceClient = AwsMessagingServiceClient({
  logWriter: logger,
});

app.use(
  "/api",
  selfRegRouterFactory(dynamoDataClient, selfRegClient, messagingServiceClient, logger),
);
app.use(
  "/api",
  formationRouterFactory(apiFormationClient, dynamoDataClient, { shouldSaveDocuments }, logger),
);
app.use("/api/external", emergencyTripPermitRouterFactory(emergencyTripPermitClient, logger));
app.use(
  "/api/taxFilings",
  taxFilingRouterFactory(dynamoDataClient, taxFilingInterface, AWSTaxIDEncryptionClient, logger),
);
app.use("/api", decryptionRouterFactory(AWSTaxIDEncryptionClient, logger));
app.use("/api", employerRatesRouterFactory(EmployerRatesClient, logger));
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
      ["tax-clearance", taxClearanceHealthCheckClient],
      ["xray-registration", xrayRegistrationHealthCheckClient],
      ["cigarette-license", cigaretteLicenseHealthCheckClient], // This endpoint is not being hit by the HealthCheck Lambda
      ["cigarette-email-client", cigaretteLicenseEmailClient.health], // This endpoint is not being hit by the HealthCheck Lambda
      ["messaging-service", messagingServiceClient.health],
      ["tax-filing-client", taxFilingClient.health],
    ]),
    logger,
  ),
);

app.use("/api", xrayRegistrationRouterFactory(updateXrayStatus, dynamoDataClient, logger));
app.use("/api", crtkLookupRouterFactory(updateCrtkStatus, dynamoDataClient, logger));

app.use("/api/guest", environmentPermitEmailRouter(environmentPermitEmailClient, logger));

app.use("/api", crtkEmailRouter(crtkEmailClient, logger));

app.post("/api/mgmt/auth", (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    logger.LogInfo(`MgmtAuth - Id:${logger.GetId()} - MATCH`);
    res.status(StatusCodes.OK).send();
  } else {
    logger.LogInfo(
      `MgmtAuth - Id:${logger.GetId()} - FAILED-AUTH request: '${req.body.password}' password: '${
        process.env.ADMIN_PASSWORD
      }'`,
    );
    res.status(StatusCodes.UNAUTHORIZED).send();
  }
});

export const handler = serverless(app);

if (require.main === module) {
  const port = process.env.PORT || 5002;
  app.listen(port, () => {
    console.log(`Local API running on http://localhost:${port}`);
  });
}

import { AirtableUserTestingClient } from "@client/AirtableUserTestingClient";
import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { addToUserTestingBatch } from "@domain/user-testing/addToUserTestingBatch";
import { addToUserTestingFactory } from "@domain/user-testing/addToUserTestingFactory";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
import { ConsoleLogWriter, LogWriter } from "@libs/logWriter";
import { GovDeliveryNewsletterClient } from "src/client/GovDeliveryNewsletterClient";
import { DynamoUserDataClient } from "src/db/DynamoUserDataClient";
import { addNewsletterBatch } from "src/domain/newsletter/addNewsletterBatch";
import { addNewsletterFactory } from "src/domain/newsletter/addNewsletterFactory";

export const handler = async (): Promise<void> => {
  const isLocal = STAGE === "local";

  const dataLogger = isLocal
    ? ConsoleLogWriter
    : LogWriter(`NavigatorDBClient/${STAGE}`, "DataMigrationLogs");
  const dynamoDb = createDynamoDbClient(IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const AWSTaxIDEncryptionClient = AWSCryptoFactory(AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY, {
    stage: AWS_CRYPTO_CONTEXT_STAGE,
    purpose: AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
    origin: AWS_CRYPTO_CONTEXT_ORIGIN,
  });
  const dbClient = DynamoUserDataClient(
    dynamoDb,
    AWSTaxIDEncryptionClient,
    USERS_TABLE,
    dataLogger,
  );
  const logger = isLocal ? ConsoleLogWriter : LogWriter(`NavigatorWebService/${STAGE}`, "ApiLogs");

  const GOV_DELIVERY_BASE_URL =
    process.env.GOV_DELIVERY_BASE_URL ||
    (isLocal
      ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`
      : "https://api.govdelivery.com");
  const GOV_DELIVERY_API_KEY = process.env.GOV_DELIVERY_API_KEY || "tempkey";
  const GOV_DELIVERY_TOPIC = process.env.GOV_DELIVERY_TOPIC || "";
  const GOV_DELIVERY_URL_QUESTION_ID = process.env.GOV_DELIVERY_URL_QUESTION_ID || "q_86783";

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
  const AIRTABLE_USER_RESEARCH_BASE_ID = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "";
  const AIRTABLE_BASE_URL =
    process.env.AIRTABLE_BASE_URL ||
    (isLocal ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000` : "https://api.airtable.com");
  const AIRTABLE_USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || "Users Dev";

  const newsletterGovDeliveryClient = GovDeliveryNewsletterClient({
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

  const addNewsletter = addNewsletterFactory(newsletterGovDeliveryClient);
  const addToAirtableUserTesting = addToUserTestingFactory(airtableUserTestingClient);

  await addNewsletterBatch(addNewsletter, dbClient);
  await addToUserTestingBatch(addToAirtableUserTesting, dbClient);
};

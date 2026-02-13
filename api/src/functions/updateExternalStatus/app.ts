import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
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

  const newsletterGovDeliveryClient = GovDeliveryNewsletterClient({
    baseUrl: GOV_DELIVERY_BASE_URL,
    topic: GOV_DELIVERY_TOPIC,
    apiKey: GOV_DELIVERY_API_KEY,
    logWriter: logger,
    // TODO: This is no longer our domain. Can we change this? Make it a variable.
    siteUrl: "navigator.business.nj.gov",
    urlQuestion: GOV_DELIVERY_URL_QUESTION_ID, // TODO: What is this? Currently undefined.
  });

  const addNewsletter = addNewsletterFactory(newsletterGovDeliveryClient);

  await addNewsletterBatch(addNewsletter, dbClient);
};

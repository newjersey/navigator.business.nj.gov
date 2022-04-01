import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { LogWriter } from "@libs/logWriter";
import { GovDeliveryNewsletterClient } from "src/client/GovDeliveryNewsletterClient";
import {
  dynamoDbTranslateConfig,
  DynamoQlUserDataClient,
  DynamoUserDataClient,
} from "src/db/DynamoUserDataClient";
import { addNewsletterBatch } from "src/domain/newsletter/addNewsletterBatch";
import { addNewsletterFactory } from "src/domain/newsletter/addNewsletterFactory";
import { AirtableUserTestingClient } from "../../client/AirtableUserTestingClient";
import { addToUserTestingBatch } from "../../domain/user-testing/addToUserTestingBatch";
import { addToUserTestingFactory } from "../../domain/user-testing/addToUserTestingFactory";

export default async function handler() {
  const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false; // set by serverless-offline
  const IS_DOCKER = process.env.IS_DOCKER === "true" || false; // set in docker-compose
  const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
  const STAGE = process.env.STAGE || "local";

  const DYNAMO_OFFLINE_PORT = process.env.DYNAMO_PORT || 8000;
  let dynamoDb: DynamoDBClient;
  let dynamoDbDocument: DynamoDBDocumentClient;
  if (IS_OFFLINE) {
    let dynamoDbEndpoint = "localhost";
    if (IS_DOCKER) {
      dynamoDbEndpoint = "dynamodb-local";
    }
    const endpoint = {
      region: "localhost",
      endpoint: `http://${dynamoDbEndpoint}:${DYNAMO_OFFLINE_PORT}`,
    };
    dynamoDb = new DynamoDBClient(endpoint);
    dynamoDbDocument = DynamoDBDocumentClient.from(dynamoDb, dynamoDbTranslateConfig);
  } else {
    dynamoDb = new DynamoDBClient({ region: "us-east-1" });
    dynamoDbDocument = DynamoDBDocumentClient.from(dynamoDb, dynamoDbTranslateConfig);
  }
  const logger = LogWriter(`NavigatorWebService/${STAGE}`, "SearchApis");
  const dbClient = DynamoUserDataClient(dynamoDbDocument, USERS_TABLE);
  const qlClient = DynamoQlUserDataClient(dynamoDb, USERS_TABLE);

  const GOV_DELIVERY_BASE_URL =
    process.env.GOV_DELIVERY_BASE_URL ||
    (IS_OFFLINE ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000` : "https://api.govdelivery.com");
  const GOV_DELIVERY_API_KEY = process.env.GOV_DELIVERY_API_KEY || "tempkey";
  const GOV_DELIVERY_TOPIC = process.env.GOV_DELIVERY_TOPIC || "NJGOV_1";
  const GOV_DELIVERY_URL_QUESTION_ID = process.env.GOV_DELIVERY_URL_QUESTION_ID || "q_86783";

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
  const AIRTABLE_USER_RESEARCH_BASE_ID = process.env.AIRTABLE_USER_RESEARCH_BASE_ID || "";
  const AIRTABLE_BASE_URL =
    process.env.AIRTABLE_BASE_URL ||
    (IS_OFFLINE ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000` : "https://api.airtable.com");

  const newsletterGovDeliveryClient = GovDeliveryNewsletterClient({
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

  const addNewsletter = addNewsletterFactory(newsletterGovDeliveryClient);
  const addToAirtableUserTesting = addToUserTestingFactory(airtableUserTestingClient);

  await addNewsletterBatch(addNewsletter, dbClient, qlClient);
  await addToUserTestingBatch(addToAirtableUserTesting, dbClient, qlClient);
}

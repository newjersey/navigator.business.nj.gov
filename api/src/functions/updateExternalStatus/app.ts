import { DynamoUserDataClient, DynamoQlUserDataClient } from "src/db/DynamoUserDataClient";
import AWS from "aws-sdk";

import { GovDeliveryNewsletterClient } from "src/client/GovDeliveryNewsletterClient";
import { addNewsletterFactory } from "src/domain/newsletter/addNewsletterFactory";
import { addNewsletterBatch } from "src/domain/newsletter/addNewsletterBatch";

import { LogWriter } from "@libs/logWriter";

export default async function handler() {
  const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false; // set by serverless-offline
  const IS_DOCKER = process.env.IS_DOCKER === "true" || false; // set in docker-compose
  const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
  const STAGE = process.env.STAGE || "local";

  const DYNAMO_OFFLINE_PORT = process.env.DYNAMO_PORT || 8000;
  let dynamoDb: AWS.DynamoDB;
  let dynamoDbDocument: AWS.DynamoDB.DocumentClient;
  if (IS_OFFLINE) {
    let dynamoDbEndpoint = "localhost";
    if (IS_DOCKER) {
      dynamoDbEndpoint = "dynamodb-local";
    }
    const endpoint = {
      region: "localhost",
      endpoint: `http://${dynamoDbEndpoint}:${DYNAMO_OFFLINE_PORT}`,
    };
    dynamoDb = new AWS.DynamoDB(endpoint);
    dynamoDbDocument = new AWS.DynamoDB.DocumentClient(endpoint);
  } else {
    dynamoDb = new AWS.DynamoDB();
    dynamoDbDocument = new AWS.DynamoDB.DocumentClient();
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
  const newsletterGovDeliveryClient = GovDeliveryNewsletterClient({
    baseUrl: GOV_DELIVERY_BASE_URL,
    topic: GOV_DELIVERY_TOPIC,
    apiKey: GOV_DELIVERY_API_KEY,
    logWriter: logger,
    siteUrl: "navigator.business.nj.gov",
    urlQuestion: GOV_DELIVERY_URL_QUESTION_ID,
  });
  const addNewsletter = addNewsletterFactory(dbClient, newsletterGovDeliveryClient);
  await addNewsletterBatch(addNewsletter, qlClient);
}

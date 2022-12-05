import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { AWSEncryptionDecryptionFactory } from "src/client/AwsEncryptionDecryptionFactory";
import {
  dynamoDbTranslateConfig,
  DynamoQlUserDataClient,
  DynamoUserDataClient,
} from "src/db/DynamoUserDataClient";
import { encryptTaxIdBatch } from "src/domain/user/encryptTaxIdBatch";
import { encryptTaxIdFactory } from "src/domain/user/encryptTaxIdFactory";

export default async function handler() {
  const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false; // set by serverless-offline
  const IS_DOCKER = process.env.IS_DOCKER === "true" || false; // set in docker-compose
  const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
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
  const dbClient = DynamoUserDataClient(dynamoDbDocument, USERS_TABLE);
  const qlClient = DynamoQlUserDataClient(dynamoDb, USERS_TABLE);

  const AWS_CRYPTO_KEY = process.env.AWS_CRYPTO_KEY || "";
  const AWS_CRYPTO_CONTEXT_STAGE = process.env.AWS_CRYPTO_CONTEXT_STAGE || "";
  const AWS_CRYPTO_CONTEXT_PURPOSE = process.env.AWS_CRYPTO_CONTEXT_PURPOSE || "";
  const AWS_CRYPTO_CONTEXT_ORIGIN = process.env.AWS_CRYPTO_CONTEXT_ORIGIN || "";

  const AWSEncryptionDecryptionClient = AWSEncryptionDecryptionFactory(AWS_CRYPTO_KEY, {
    stage: AWS_CRYPTO_CONTEXT_STAGE,
    purpose: AWS_CRYPTO_CONTEXT_PURPOSE,
    origin: AWS_CRYPTO_CONTEXT_ORIGIN,
  });

  const encryptTaxId = encryptTaxIdFactory(AWSEncryptionDecryptionClient);
  await encryptTaxIdBatch(encryptTaxId, dbClient, qlClient);
}

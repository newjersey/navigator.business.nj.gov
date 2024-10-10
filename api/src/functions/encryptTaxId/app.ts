import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { LogWriter } from "@libs/logWriter";
import { AWSEncryptionDecryptionFactory } from "src/client/AwsEncryptionDecryptionFactory";
import { DynamoUserDataClient } from "src/db/DynamoUserDataClient";
import { encryptTaxIdBatch } from "src/domain/user/encryptTaxIdBatch";
import { encryptTaxIdFactory } from "src/domain/user/encryptTaxIdFactory";

export default async function handler(): Promise<void> {
  const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false; // set by serverless-offline
  const IS_DOCKER = process.env.IS_DOCKER === "true" || false; // set in docker-compose
  const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
  const DYNAMO_OFFLINE_PORT = process.env.DYNAMO_PORT || 8000;
  const STAGE = process.env.STAGE || "local";
  const dataLogger = LogWriter(`NavigatorDBClient/${STAGE}`, "DataMigrationLogs");

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

  const dbClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, dataLogger);

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
  await encryptTaxIdBatch(encryptTaxId, dbClient);
}

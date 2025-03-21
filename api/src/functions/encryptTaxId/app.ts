import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_PURPOSE,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_KEY,
  DYNAMO_OFFLINE_PORT,
  IS_DOCKER,
  IS_OFFLINE,
  STAGE,
  USERS_TABLE,
} from "@functions/config";
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
  const dataLogger = LogWriter(`aws/${STAGE}`, "DataMigrationLogs");

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


  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const dbClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, dataLogger);

  const AWSEncryptionDecryptionClient = AWSEncryptionDecryptionFactory(AWS_CRYPTO_KEY, {
    stage: AWS_CRYPTO_CONTEXT_STAGE,
    purpose: AWS_CRYPTO_CONTEXT_PURPOSE,
    origin: AWS_CRYPTO_CONTEXT_ORIGIN,
  });

  const encryptTaxId = encryptTaxIdFactory(AWSEncryptionDecryptionClient);
  await encryptTaxIdBatch(encryptTaxId, dbClient);
}

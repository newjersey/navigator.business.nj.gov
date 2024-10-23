import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { LogWriter } from "@libs/logWriter";
import { AWSEncryptionDecryptionFactory } from "src/client/AwsEncryptionDecryptionFactory";
import { DynamoUserDataClient } from "src/db/DynamoUserDataClient";
import { encryptTaxIdBatch } from "src/domain/user/encryptTaxIdBatch";
import { encryptTaxIdFactory } from "src/domain/user/encryptTaxIdFactory";

export default async function handler(): Promise<void> {
  const IS_OFFLINE = process.env.IS_OFFLINE === "true" || false; // set by serverless-offline
  const IS_DOCKER = process.env.IS_DOCKER === "true" || false; // set in docker-compose
  const USERS_TABLE = process.env.USERS_TABLE || "users-table-local";
  const DYNAMO_OFFLINE_PORT = Number.parseInt(process.env.DYNAMO_PORT || "8000");
  const STAGE = process.env.STAGE || "local";
  const logger = LogWriter(`aws/${STAGE}`, "DataMigrationLogs");

  const dynamoDb = createDynamoDbClient(IS_OFFLINE, IS_DOCKER, DYNAMO_OFFLINE_PORT);
  const dbClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, logger);

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

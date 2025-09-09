/* eslint-disable @typescript-eslint/no-explicit-any */
// Run yarn ts-node -r tsconfig-paths/register scripts/populateLocalDynamoDbWithMigrations.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

/*
  This script is for testing purposes. It populates the local DynamoDB with users
  that have outdated versions in order to test the migrationUsersVersion Lambda function.
  The goal is to ensure that the migration logic works as expected when handling outdated user data.
*/
import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoDataClient } from "@db/DynamoDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import {
  AWS_CRYPTO_CONTEXT_ORIGIN,
  AWS_CRYPTO_CONTEXT_STAGE,
  AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY,
  BUSINESSES_TABLE,
  USERS_TABLE,
} from "@functions/config";
import { generateUserData } from "@shared/test";
import { CURRENT_VERSION, UserData } from "@shared/userData";

const BATCH_SIZE = 25;
const dynamoDb = createDynamoDbClient(true, false, 8000);

const AWSTaxIDEncryptionClient = AWSCryptoFactory(AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY, {
  stage: AWS_CRYPTO_CONTEXT_STAGE,
  purpose: AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE,
  origin: AWS_CRYPTO_CONTEXT_ORIGIN,
});
const isKillSwitchOn = async (): Promise<boolean> => {
  return false;
};
class BasicLogger {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  LogInfo(message: any, ...optionalParams: any[]): void {
    console.log(`INFO [${this.id}]:`, message, ...optionalParams);
  }
  LogError(message: any, ...optionalParams: any[]): void {
    console.error(`ERROR [${this.id}]:`, message, ...optionalParams);
  }
  GetId(): string {
    return this.id;
  }
}
const logger = new BasicLogger("testMigration");

const generateUsers = (totalUsers: number): { userData: UserData; isOutdated: boolean }[] => {
  return Array.from({ length: totalUsers }, () => {
    const isOutdated = Math.random() < 0.5;
    const userData = generateUserData({
      version: isOutdated ? CURRENT_VERSION - 1 : CURRENT_VERSION,
    });

    return { userData, isOutdated };
  });
};

const batchWriteUsers = async (users: any[]): Promise<number> => {
  const chunks = [];
  let outdatedVersionCount = 0;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    chunks.push(users.slice(i, i + BATCH_SIZE));
  }
  for (const chunk of chunks) {
    const putRequests = chunk.map(({ userData, isOutdated }) => {
      if (isOutdated) {
        outdatedVersionCount++;
      }
      const marshalledItem = marshall(
        {
          userId: userData.user.id,
          email: userData.user.email,
          data: userData,
          version: userData.version,
        },
        { removeUndefinedValues: true },
      );

      return {
        PutRequest: { Item: marshalledItem },
      };
    });

    const params = { RequestItems: { [USERS_TABLE]: putRequests } };
    try {
      await dynamoDb.send(new BatchWriteItemCommand(params));
    } catch (error) {
      console.error("Error inserting users:", error);
      throw new Error("Failed to insert users into DynamoDB");
    }
  }
  console.log(`Total outdated versions inserted: ${outdatedVersionCount}`);
  return outdatedVersionCount;
};

const run = async (): Promise<void> => {
  console.log("Generating user data...");
  const users = generateUsers(2000);

  console.log("Inserting users into local DynamoDB...");
  const outdatedVersionCount = await batchWriteUsers(users);
  console.log("Done inserting users.");
  console.log(`Starting migration of ${outdatedVersionCount} users`);

  const userDataClient = DynamoUserDataClient(
    dynamoDb,
    AWSTaxIDEncryptionClient,
    USERS_TABLE,
    logger,
  );
  const businessesDataClient = DynamoBusinessDataClient(dynamoDb, BUSINESSES_TABLE, logger);
  const dynamoDataClient = DynamoDataClient(
    userDataClient,
    businessesDataClient,
    logger,
    isKillSwitchOn,
  );

  await dynamoDataClient.migrateOutdatedVersionUsers();
};

run().catch(console.error); // eslint-disable-line unicorn/prefer-top-level-await

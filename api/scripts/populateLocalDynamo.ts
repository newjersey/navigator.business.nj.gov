/* eslint-disable no-restricted-imports */
// Run yarn ts-node -r tsconfig-paths/register scripts/populateLocalDynamo.ts
import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { generateUserData } from "../../shared/src/test";
import { CURRENT_VERSION } from "../../shared/src/userData";
import { createDynamoDbClient } from "../src/db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "../src/db/DynamoBusinessDataClient";
import { DynamoDataClient } from "../src/db/DynamoDataClient";
import { DynamoUserDataClient } from "../src/db/DynamoUserDataClient";
import { BUSINESSES_TABLE, USERS_TABLE } from "../src/functions/config";

const BATCH_SIZE = 25;
const dynamoDb = createDynamoDbClient(true, false, 8000);

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
const generateUsers = (totalUsers: number) => {
  return Array.from({ length: totalUsers }, () => {
    const isOutdated = Math.random() < 0.5;
    const userData = generateUserData({
      version: isOutdated ? CURRENT_VERSION - 1 : CURRENT_VERSION,
    });

    return { userData, isOutdated };
  });
};

const batchWriteUsers = async (users: any[]) => {
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
        { removeUndefinedValues: true }
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
    }
  }
  console.log(`Total outdated versions inserted: ${outdatedVersionCount}`);
  return outdatedVersionCount;
};
const run = async () => {
  console.log("Generating user data...");
  const users = generateUsers(2000);

  console.log("Inserting users into local DynamoDB...");
  const outdatedVersionCount = await batchWriteUsers(users);
  console.log("Done inserting users.");
  console.log(`starting migration ... of ${outdatedVersionCount} users`);
  const userDataClient = DynamoUserDataClient(dynamoDb, USERS_TABLE, logger);
  const businessesDataClient = DynamoBusinessDataClient(dynamoDb, BUSINESSES_TABLE, logger);
  const dynamoDataClient = DynamoDataClient(userDataClient, businessesDataClient, logger);
  await dynamoDataClient.migrateData();
};

run().catch(console.error);

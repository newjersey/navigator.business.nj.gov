/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecuteStatementCommand,
  QueryCommand,
  type QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { type DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Migrations } from "@db/migrations/migrations";
import { type MigrationClients } from "@db/migrations/types";
import { type CryptoClient, type UserDataClient } from "@domain/types";
import { type LogWriterType } from "@libs/logWriter";
import { CURRENT_VERSION, type UserData } from "@shared/userData";

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

export const dynamoDbTranslateConfig = { marshallOptions, unmarshallOptions };

export const createUserDataItem = (userData: UserData): Record<string, unknown> => ({
  userId: userData.user.id,
  email: userData.user.email,
  data: userData,
  version: userData.version,
});

export const DynamoUserDataClient = (
  db: DynamoDBDocumentClient,
  cryptoClient: CryptoClient,
  tableName: string,
  logger: LogWriterType,
  migrationClients?: Omit<MigrationClients, "cryptoClient">,
): UserDataClient => {
  const migrateToLatest = async (data: UserData): Promise<UserData> => {
    const logId = logger.GetId();
    const dataVersion = data.version ?? CURRENT_VERSION;
    const migrationsToRun = Migrations.slice(dataVersion);
    let migratedData = structuredClone(data);
    for (const migration of migrationsToRun) {
      try {
        logger.LogInfo(
          `Database Migration - Id:${logId} - Upgrading from ${migratedData.version} to ${
            Number(migratedData.version) + 1
          }`,
        );
        migratedData = await Promise.resolve(
          migration(migratedData, { cryptoClient, ...migrationClients, logger }),
        );
      } catch (error) {
        logger.LogError(
          `Database Migration Error - Id:${logId} - Failed upgrading to ${
            Number(migratedData.version) + 1
          } - Error: ${error}`,
        );
        throw error;
      }
    }
    return migratedData;
  };

  const findByEmail = async (email: string): Promise<UserData | undefined> => {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email },
      },
    };
    return db
      .send(new QueryCommand(params))
      .then((result) => {
        // implicitly returns only the first match if multiple matches are found
        if (!result.Items || result.Items.length === 0) {
          return;
        }
        return unmarshall(result.Items[0], unmarshallOptions).data;
      })
      .catch((error) => {
        console.log(error);
        throw new Error("Not found");
      });
  };

  const get = async (userId: string): Promise<UserData> => {
    const params = {
      TableName: tableName,
      Key: {
        userId: userId,
      },
    };
    return db
      .send(new GetCommand(params))

      .then(async (result) => {
        if (!result.Item) {
          logger.LogInfo(`User with ID ${userId} not found in table ${tableName}`);
          throw new Error("Not found");
        }
        return result.Item.data;
      })
      .catch((error) => {
        throw error;
      });
  };

  const put = async (userData: UserData): Promise<UserData> => {
    const params = {
      TableName: tableName,
      Item: createUserDataItem(userData),
    };
    return db
      .send(new PutCommand(params))
      .then(() => {
        return userData;
      })
      .catch((error) => {
        throw error;
      });
  };

  const getNeedNewsletterUsers = (): Promise<UserData[]> => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["user"].receiveNewsletter = true and (data["user"].externalStatus.newsletter is missing or data["user"].externalStatus.newsletter.success = false)`;
    return search(statement);
  };

  const getNeedTaxIdEncryptionUsers = (): Promise<UserData[]> => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["profileData"].encryptedTaxId IS MISSING AND data["profileData"].taxId IS NOT MISSING`;
    return search(statement);
  };
  const getUsersWithOutdatedVersion = async (
    latestVersion: number,
    nextToken?: string,
  ): Promise<{ usersToMigrate: UserData[]; nextToken?: string }> => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["version"] < ${latestVersion}`;
    return await searchWithPagination(statement, nextToken);
  };

  const searchWithPagination = async (
    statement: string,
    nextToken?: string,
  ): Promise<{ usersToMigrate: UserData[]; nextToken?: string }> => {
    const { Items = [], NextToken } = await db.send(
      new ExecuteStatementCommand({
        Statement: statement,
        NextToken: nextToken,
      }),
    );

    const usersToMigrate = Items.map((object: any): UserData => {
      return unmarshall(object).data;
    });

    return { usersToMigrate, nextToken: NextToken };
  };

  const search = async (statement: string): Promise<UserData[]> => {
    const { Items = [] } = await db.send(new ExecuteStatementCommand({ Statement: statement }));
    return await Promise.all(
      Items.map(async (object: any): Promise<UserData> => {
        return unmarshall(object).data;
      }),
    );
  };

  return {
    get,
    put,
    migrateToLatest,
    findByEmail,
    getNeedNewsletterUsers,
    getNeedTaxIdEncryptionUsers,
    getUsersWithOutdatedVersion,
  };
};

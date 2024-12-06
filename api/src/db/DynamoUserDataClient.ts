/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExecuteStatementCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { MigrationFunction, Migrations } from "@db/migrations/migrations";
import { UserDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { CURRENT_VERSION, UserData } from "@shared/userData";

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

export const migrateUserData = (data: any, logger: LogWriterType): any => {
  const logId = logger.GetId();
  const dataVersion = data.version ?? CURRENT_VERSION;
  const migrationsToRun = Migrations.slice(dataVersion);
  const migratedData = migrationsToRun.reduce((prevData: any, migration: MigrationFunction) => {
    try {
      logger.LogInfo(
        `Dynamo User Migration - Id:${logId} - Upgrading ${data.user.id} from ${prevData.version} to ${
          Number(prevData.version) + 1
        }`
      );
      return migration(prevData);
    } catch (error) {
      logger.LogError(
        `Dynamo User Migration Error - Id:${logId} - Error: ${error} - Data: ${JSON.stringify(prevData)}`
      );
    }
  }, data);
  return { ...migratedData, version: CURRENT_VERSION };
};

export const DynamoUserDataClient = (
  db: DynamoDBDocumentClient,
  tableName: string,
  logger: LogWriterType
): UserDataClient => {
  const doMigration = async (data: any): Promise<UserData> => {
    const migratedData = migrateUserData(data, logger);
    await put(migratedData);
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
        return doMigration(unmarshall(result.Items[0], unmarshallOptions).data);
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
          throw new Error("Not found");
        }
        return await doMigration(result.Item.data);
      })
      .catch((error) => {
        throw error;
      });
  };

  const put = async (userData: UserData): Promise<UserData> => {
    const migratedData = migrateUserData(userData, logger);
    const params = {
      TableName: tableName,
      Item: {
        userId: migratedData.user.id,
        email: migratedData.user.email,
        data: migratedData,
      },
    };
    return db
      .send(new PutCommand(params))
      .then(() => {
        return migratedData;
      })
      .catch((error) => {
        throw error;
      });
  };

  const getNeedNewsletterUsers = (): Promise<UserData[]> => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["user"].receiveNewsletter = true and (data["user"].externalStatus.newsletter is missing or data["user"].externalStatus.newsletter.success = false)`;
    return search(statement);
  };

  const getNeedToAddToUserTestingUsers = (): Promise<UserData[]> => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["user"].userTesting = true and (data["user"].externalStatus.userTesting is missing or data["user"].externalStatus.userTesting.success = false)`;
    return search(statement);
  };

  const getNeedTaxIdEncryptionUsers = (): Promise<UserData[]> => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["profileData"].encryptedTaxId IS MISSING AND data["profileData"].taxId IS NOT MISSING`;
    return search(statement);
  };

  const getUsersWithOutdatedVersion = async (latestVersion: number): Promise<UserData[]> => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["version"] < ${CURRENT_VERSION}`;
    return await search(statement);
  };

  const search = async (statement: string): Promise<UserData[]> => {
    const { Items = [] } = await db.send(new ExecuteStatementCommand({ Statement: statement }));
    return await Promise.all(
      Items.map(async (object: any): Promise<UserData> => {
        const data = unmarshall(object).data;
        return await doMigration(data);
      })
    );
  };

  return {
    get,
    put,
    findByEmail,
    getNeedNewsletterUsers,
    getNeedToAddToUserTestingUsers,
    getNeedTaxIdEncryptionUsers,
    getUsersWithOutdatedVersion,
  };
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecuteStatementCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { batchWrite } from "@db/config/dynamoDbConfig";
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

export const DynamoUserDataClient = (
  db: DynamoDBDocumentClient,
  tableName: string,
  logger: LogWriterType
): UserDataClient => {
  const migrateData = (data: UserData, logger: LogWriterType): any => {
    const logId = logger.GetId();
    const dataVersion = data.version ?? CURRENT_VERSION;
    const migrationsToRun = Migrations.slice(dataVersion);
    const migratedData = migrationsToRun.reduce((prevData: any, migration: MigrationFunction) => {
      try {
        logger.LogInfo(
          `Database Migration - Id:${logId} - Upgrading ${data.user.id} from ${prevData.version} to ${
            Number(prevData.version) + 1
          }`
        );
        return migration(prevData);
      } catch (error) {
        logger.LogError(
          `Database Migration Error - Id:${logId} - Error: ${error} - Data: ${JSON.stringify(prevData)}`
        );
      }
    }, data);
    return { ...migratedData, version: CURRENT_VERSION };
  };

  const doMigration = async (data: UserData): Promise<UserData> => {
    const migratedData = migrateData(data, logger);
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
          logger.LogInfo(`User with ID ${userId} not found in table ${tableName}`);
          throw new Error("Not found");
        }
        return await doMigration(result.Item.data);
      })
      .catch((error) => {
        throw error;
      });
  };

  const put = async (userData: UserData): Promise<UserData> => {
    const migratedData = migrateData(userData, logger);
    const params = {
      TableName: tableName,
      Item: {
        userId: migratedData.user.id,
        email: migratedData.user.email,
        data: migratedData,
        version: migratedData.version,
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
  const getUsersWithOutdatedVersion = async (
    latestVersion: number,
    nextToken?: string
  ): Promise<{ usersToMigrate: UserData[]; nextToken?: string }> => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["version"] < ${latestVersion}`;
    return await searchWithPagination(statement, nextToken);
  };

  const searchWithPagination = async (
    statement: string,
    nextToken?: string
  ): Promise<{ usersToMigrate: UserData[]; nextToken?: string }> => {
    const { Items = [], NextToken } = await db.send(
      new ExecuteStatementCommand({
        Statement: statement,
        NextToken: nextToken,
      })
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
        const data = unmarshall(object).data;
        return await doMigration(data);
      })
    );
  };

  const batchWriteToTable = async (chunkedItems: UserData[]): Promise<void> => {
    await batchWrite(db, tableName, chunkedItems, logger);
  };
  return {
    get,
    put,
    findByEmail,
    getNeedNewsletterUsers,
    getNeedToAddToUserTestingUsers,
    getNeedTaxIdEncryptionUsers,
    getUsersWithOutdatedVersion,
    batchWriteToTable,
  };
};

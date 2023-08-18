/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExecuteStatementCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { CURRENT_VERSION, UserData } from "@shared/userData";
import { UserDataClient } from "../domain/types";
import { MigrationFunction, Migrations } from "./migrations/migrations";

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false // false, by default.
};

export const dynamoDbTranslateConfig = { marshallOptions, unmarshallOptions };

const migrateUserData = (data: any): any => {
  const dataVersion = data.version ?? CURRENT_VERSION;
  const migrationsToRun = Migrations.slice(dataVersion);
  const migratedData = migrationsToRun.reduce((prevData: any, migration: MigrationFunction) => {
    return migration(prevData);
  }, data);
  return { ...migratedData, version: CURRENT_VERSION };
};

export const DynamoUserDataClient = (db: DynamoDBDocumentClient, tableName: string): UserDataClient => {
  const doMigration = async (data: any): Promise<UserData> => {
    const migratedData = migrateUserData(data);
    await put(migratedData);
    return migratedData;
  };

  const findByEmail = (email: string): Promise<UserData | undefined> => {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email }
      }
    };
    return db
      .send(new QueryCommand(params))
      .then(async (result) => {
        if (!result.Items || result.Items.length !== 1) {
          return;
        }
        return await doMigration(unmarshall(result.Items[0], unmarshallOptions).data);
      })
      .catch((error) => {
        console.log(error);
        throw new Error("Not found");
      });
  };

  const get = (userId: string): Promise<UserData> => {
    const params = {
      TableName: tableName,
      Key: {
        userId: userId
      }
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

  const put = (userData: UserData): Promise<UserData> => {
    const migratedData = migrateUserData(userData);
    const params = {
      TableName: tableName,
      Item: {
        userId: migratedData.user.id,
        email: migratedData.user.email,
        data: migratedData
      }
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
    getNeedTaxIdEncryptionUsers
  };
};

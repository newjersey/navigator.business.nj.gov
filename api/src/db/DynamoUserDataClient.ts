/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DynamoDBClient,
  ExecuteStatementCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { UserData } from "@shared/userData";
import { UserDataClient, UserDataQlClient } from "../domain/types";
import { CURRENT_VERSION, MigrationFunction, Migrations } from "./migrations/migrations";

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

const migrateUserData = (data: any): any => {
  const dataVersion = data.version || 0;
  const migrationsToRun = Migrations.slice(dataVersion);
  const migratedData = migrationsToRun.reduce((prevData: any, migration: MigrationFunction) => {
    return migration(prevData);
  }, data);
  return migratedData;
};

export const DynamoQlUserDataClient = (db: DynamoDBClient, tableName: string): UserDataQlClient => {
  const search = async (statement: string): Promise<UserData[]> => {
    const { Items = [] } = await db.send(new ExecuteStatementCommand({ Statement: statement }));
    const get = (object: any): UserData => {
      const data = unmarshall(object).data;
      const { version, ...userData } = migrateUserData(data);
      return userData;
    };
    return Items.map((i) => get(i));
  };

  const getNeedNewsletterUsers = () => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["user"].receiveNewsletter = true and (data["user"].externalStatus.newsletter is missing or data["user"].externalStatus.newsletter.success = false)`;
    return search(statement);
  };

  const getNeedToAddToUserTestingUsers = () => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["user"].userTesting = true and (data["user"].externalStatus.userTesting is missing or data["user"].externalStatus.userTesting.success = false)`;
    return search(statement);
  };

  return {
    search,
    getNeedNewsletterUsers,
    getNeedToAddToUserTestingUsers,
  };
};

export const DynamoUserDataClient = (db: DynamoDBDocumentClient, tableName: string): UserDataClient => {
  const doMigration = async (data: any): Promise<UserData> => {
    const migratedData = migrateUserData(data);
    await put(migratedData);
    const { version, ...userData } = migratedData;
    return userData;
  };

  const findByEmail = (email: string): Promise<UserData | undefined> => {
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
      .then(async (result) => {
        if (!result.Items || result.Items.length !== 1) {
          return Promise.resolve(undefined);
        }
        return await doMigration(unmarshall(result.Items[0], unmarshallOptions).data);
      })
      .catch((error) => {
        console.log(error);
        return Promise.reject("Not found");
      });
  };

  const get = (userId: string): Promise<UserData> => {
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
          return Promise.reject("Not found");
        }
        return await doMigration(result.Item.data);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  };

  const put = (userData: UserData): Promise<UserData> => {
    const params = {
      TableName: tableName,
      Item: {
        userId: userData.user.id,
        email: userData.user.email,
        data: {
          ...userData,
          version: CURRENT_VERSION,
        },
      },
    };

    return db
      .send(new PutCommand(params))
      .then(() => {
        return userData;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  };

  return {
    get,
    put,
    findByEmail,
  };
};

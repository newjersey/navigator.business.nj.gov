/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import AWS from "aws-sdk";
import { UserData, UserDataClient, UserDataQlClient } from "../domain/types";
import { CURRENT_VERSION, MigrationFunction, Migrations } from "./migrations/migrations";

const migrateUserData = (data: any): any => {
  const dataVersion = data.version || 0;
  const migrationsToRun = Migrations.slice(dataVersion);
  const migratedData = migrationsToRun.reduce((prevData: any, migration: MigrationFunction) => {
    return migration(prevData);
  }, data);
  return migratedData;
};

export const DynamoQlUserDataClient = (db: AWS.DynamoDB, tableName: string): UserDataQlClient => {
  const search = async (statement: string): Promise<UserData[]> => {
    const { Items = [] } = await db.executeStatement({ Statement: statement }).promise();
    const get = (object: any): UserData => {
      const data = AWS.DynamoDB.Converter.unmarshall(object).data;
      const { version, ...userData } = migrateUserData(data);
      return userData;
    };
    return Items.map((i) => get(i));
  };

  const getNeedNewsletterUsers = () => {
    const statement = `SELECT data FROM "${tableName}" WHERE data["user"].receiveNewsletter = true and (data["user"].externalStatus.newsletter is missing or data["user"].externalStatus.newsletter.success = false)`;
    return search(statement);
  };
  return {
    search,
    getNeedNewsletterUsers,
  };
};
export const DynamoUserDataClient = (db: AWS.DynamoDB.DocumentClient, tableName: string): UserDataClient => {
  const doMigration = async (data: any): Promise<UserData> => {
    const migratedData = migrateUserData(data);
    await put(migratedData);
    const { version, ...userData } = migratedData;
    return userData;
  };

  const findByEmail = (email: string): Promise<UserData | undefined> => {
    const params = {
      TableName: tableName,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };
    return db
      .query(params)
      .promise()
      .then(async (result) => {
        if (!result.Items || result.Items.length !== 1) {
          return Promise.resolve(undefined);
        }
        return await doMigration(result.Items[0].data);
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
      .get(params)
      .promise()
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
      .put(params)
      .promise()
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

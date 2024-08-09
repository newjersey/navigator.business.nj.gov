/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExecuteStatementCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { MigrationFunction, Migrations } from "@db/migrations/migrations";
import { UserDataClient } from "@domain/types";
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
        ":email": { S: email },
      },
    };
    try {
      const queryCommand = new QueryCommand(params);
      return db
        .send(queryCommand)
        .then(async (result) => {
          if (!result.Items || result.Items.length !== 1) {
            return;
          }
          const unmarshalledItem = unmarshall(result.Items[0], unmarshallOptions);
          console.log({ unmarshalledItem: JSON.stringify(unmarshalledItem, undefined, 2) });
          const migratedData = await doMigration(unmarshalledItem.data);
          console.log({ migratedData: JSON.stringify(migratedData, undefined, 2) });
          return migratedData;
        })
        .catch((error) => {
          console.log(error);
          throw new Error(`Not found: ${error}`);
        });
    } catch (error) {
      throw new Error(`problem with queryCommand: ${error}`);
    }
  };

  const get = (userId: string): Promise<UserData> => {
    const params = {
      TableName: tableName,
      Key: {
        userId: userId,
      },
    };

    try {
      const getCommand = new GetCommand(params);

      return db
        .send(getCommand)

        .then(async (result) => {
          if (!result.Item) {
            throw new Error("Not found");
          }
          return await doMigration(result.Item.data);
        })
        .catch((error) => {
          throw new Error(`problem with db.send: ${error}`);
        });
    } catch (error) {
      throw new Error(`problem with getcommand: ${error}`);
    }
  };

  const put = (userData: UserData): Promise<UserData> => {
    const migratedData = migrateUserData(userData);
    console.log(JSON.stringify(migratedData, undefined, 2));
    const params = {
      TableName: tableName,
      Item: {
        userId: migratedData.user.id,
        email: migratedData.user.email,
        data: migratedData,
      },
    };

    try {
      const putCommand = new PutCommand(params);

      return db
        .send(putCommand)
        .then(() => {
          return migratedData;
        })
        .catch((error) => {
          throw new Error(`problem with db.send: ${error}`);
        });
    } catch (error) {
      throw new Error(`problem with PutCommand: ${error}`);
    }
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
    getNeedTaxIdEncryptionUsers,
  };
};

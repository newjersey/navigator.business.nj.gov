/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExecuteStatementCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { migrateData } from "@db/config/dynamoDbConfig";
import { BusinessesDataClient } from "@domain/types";
import { Business } from "@shared/userData";

export const DynamoBusinessesDataClient = (
  db: DynamoDBDocumentClient,
  tableName: string
): BusinessesDataClient => {
  const doMigration = async (data: any): Promise<Business> => {
    const migratedData = migrateData(data);
    await put(migratedData);
    return migratedData;
  };

  const findBusinessByIndex = (
    indexName: string,
    keyConditionExpression: string,
    expressionAttributeValues: { [key: string]: any }
  ): Promise<Business | undefined> => {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    return db
      .send(new QueryCommand(params))
      .then((result) => {
        if (!result.Items || result.Items.length !== 1) {
          return;
        }
        const item = unmarshall(result.Items[0]);
        return doMigration(item.data);
      })
      .catch((error) => {
        console.log(error);
        throw new Error("Not found");
      });
  };

  const findAllBusinessesByIndex = (
    indexName: string,
    keyConditionExpression: string,
    expressionAttributeValues: { [key: string]: any }
  ): Promise<Business[]> => {
    const params: QueryCommandInput = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    return db
      .send(new QueryCommand(params))
      .then((result) => {
        if (!result.Items || result.Items.length === 0) {
          return [];
        }
        const businesses = result.Items.map((item) => unmarshall(item));
        return Promise.all(businesses.map(async (item) => await doMigration(item.data)));
      })
      .catch((error) => {
        console.log(error);
        throw new Error("Error retrieving items");
      });
  };

  const findAllByNAICSCode = (naicsCode: string): Promise<Business[]> => {
    return findAllBusinessesByIndex("NaicsCode", "naicsCode = :naicsCode", {
      ":naicsCode": { S: naicsCode },
    });
  };

  const findAllByIndustry = (industry: string): Promise<Business[]> => {
    return findAllBusinessesByIndex("Industry", "industry = :industry", { ":industry": { S: industry } });
  };

  const findByBusinessName = (businessName: string): Promise<Business | undefined> => {
    return findBusinessByIndex("BusinessName", "businessName = :businessName", {
      ":businessName": { S: businessName },
    });
  };

  const findByEncryptedTaxId = (encryptedTaxId: string): Promise<Business | undefined> => {
    return findBusinessByIndex("EncryptedTaxId", "encryptedTaxId = :encryptedTaxId", {
      ":encryptedTaxId": { S: encryptedTaxId },
    });
  };

  const get = (businessId: string): Promise<Business> => {
    const params = {
      TableName: tableName,
      Key: {
        businessId: businessId,
      },
    };
    return db
      .send(new GetCommand(params))

      .then((result) => {
        if (!result.Item) {
          throw new Error("Not found");
        }
        return doMigration(result.Item.data);
      });
  };

  const put = async (businessData: Business): Promise<Business> => {
    const migratedData = migrateData(businessData);
    const params = {
      TableName: tableName,
      Item: {
        businessId: migratedData.id,
        businessName: migratedData.profileData.businessName,
        naicsCode: migratedData.profileData.naicsCode,
        industry: migratedData.profileData.industryId,
        encryptedTaxId: migratedData.profileData.encryptedTaxId,
        data: migratedData,
      },
    };

    return db.send(new PutCommand(params)).then(() => {
      return migratedData;
    });
  };

  const deleteBusinessById = async (businessId: string): Promise<void> => {
    const params = {
      TableName: tableName,
      Key: {
        businessId: businessId,
      },
    };

    return db
      .send(new DeleteCommand(params))
      .then(() => {
        console.log(`Business with ID ${businessId} deleted successfully.`);
      })
      .catch((error) => {
        console.error("Error deleting business:", error);
        throw new Error("Failed to delete business");
      });
  };

  const search = async (statement: string): Promise<Business[]> => {
    const { Items = [] } = await db.send(new ExecuteStatementCommand({ Statement: statement }));
    return await Promise.all(
      Items.map(async (object: any): Promise<Business> => {
        const data = unmarshall(object).data;
        return await doMigration(data);
      })
    );
  };

  return {
    get,
    put,
    deleteBusinessById,
    findByBusinessName,
    findByEncryptedTaxId,
    findAllByIndustry,
    findAllByNAICSCode,
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AttributeValue,
  BatchWriteItemCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { BusinessesDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { Business } from "@shared/userData";

export const DynamoBusinessDataClient = (
  db: DynamoDBDocumentClient,
  tableName: string,
  logger: LogWriterType
): BusinessesDataClient => {
  const findSingleBusinessByIndex = (
    indexName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, AttributeValue>
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
        return item.data;
      })
      .catch((error: Error) => {
        logger.LogError(`Error finding business by index: ${indexName} with error: ${error.message}`);
        throw new Error("Not found");
      });
  };

  const findAllBusinessesByIndex = (
    indexName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, AttributeValue>
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
        return Promise.all(businesses.map(async (item) => await item.data));
      })
      .catch((error: Error) => {
        logger.LogError(`Error finding business by index: ${indexName} with error: ${error.message}`);
        throw new Error("Error retrieving items");
      });
  };

  const findAllByBusinessName = (businessName: string): Promise<Business[]> => {
    return findAllBusinessesByIndex("BusinessName", "businessName = :businessName", {
      ":businessName": { S: businessName },
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
    return findSingleBusinessByIndex("BusinessName", "businessName = :businessName", {
      ":businessName": { S: businessName },
    });
  };

  const findByEncryptedTaxId = (encryptedTaxId: string): Promise<Business | undefined> => {
    return findSingleBusinessByIndex("EncryptedTaxId", "encryptedTaxId = :encryptedTaxId", {
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
    return db.send(new GetCommand(params)).then((result) => {
      if (!result.Item) {
        throw new Error(`Business with ID ${businessId} not found in table ${tableName}`);
      }
      return result.Item.data;
    });
  };

  const put = async (businessData: Business): Promise<Business> => {
    const businessName = businessData.profileData.businessName;
    const naicsCode = businessData.profileData.naicsCode;
    const params = {
      TableName: tableName,
      Item: {
        businessId: businessData.id,
        industry: businessData.profileData.industryId,
        encryptedTaxId: businessData.profileData.encryptedTaxId,
        data: businessData,
        // Replaces empty strings with `undefined` to avoid indexing empty values in DynamoDB.
        businessName: businessName === "" ? undefined : businessData.profileData.businessName,
        naicsCode: naicsCode === "" ? undefined : businessData.profileData.naicsCode,
      },
    };
    return db.send(new PutCommand(params)).then(() => {
      return businessData;
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
        logger.LogError("Error deleting business:", error);
        throw new Error("Failed to delete business");
      });
  };

  const batchWriteToTable = async (chunkedItems: Business[]): Promise<void> => {
    await batchWrite(db, tableName, chunkedItems, logger);
  };

  const batchWrite = async (
    db: DynamoDBDocumentClient,
    tableName: string,
    chunkedItems: any[],
    logger: LogWriterType
  ): Promise<void> => {
    logger.LogInfo(`Received ${chunkedItems.length} items for batch write to ${tableName}`);

    const validItems = chunkedItems.filter((item) => item !== null);

    if (validItems.length === 0) {
      logger.LogError("No valid items to batch write.");
      return;
    }
    const requestItems = validItems.map((item) => ({
      PutRequest: {
        Item: item,
      },
    }));

    try {
      const params = {
        RequestItems: {
          [tableName]: requestItems,
        },
      };

      logger.LogInfo(`Batch write started for table ${tableName} with ${chunkedItems.length} valid items`);
      await db.send(new BatchWriteItemCommand(params));
      logger.LogInfo(`Batch write successful for table ${tableName}`);
    } catch (error) {
      logger.LogError(`Batch write failed for table ${tableName} - Error: ${error}`);
      throw new Error("Batch write failed");
    }
  };

  return {
    get,
    put,
    deleteBusinessById,
    findByBusinessName,
    findByEncryptedTaxId,
    findAllByIndustry,
    findAllByNAICSCode,
    findAllByBusinessName,
    batchWriteToTable,
  };
};

import { BatchWriteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { LogWriterType } from "@libs/logWriter";

export const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

export const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

export const dynamoDbTranslateConfig = { marshallOptions, unmarshallOptions };

export const createDynamoDbClient = (
  isOffline: boolean,
  isDocker: boolean,
  dynamoPort: number
): DynamoDBDocumentClient => {
  let dynamoDb: DynamoDBDocumentClient;

  if (isOffline) {
    const dynamoDbEndpoint = isDocker ? "dynamodb-local" : "localhost";
    dynamoDb = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: "us-east-1",
        endpoint: `http://${dynamoDbEndpoint}:${dynamoPort}`,
      }),
      dynamoDbTranslateConfig
    );
  } else {
    dynamoDb = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: "us-east-1",
      }),
      dynamoDbTranslateConfig
    );
  }

  return dynamoDb;
};

export const BATCH_SIZE = 25;
export const CONCURRENCY_LIMIT = 5;

export const batchWrite = async <T>(
  db: DynamoDBDocumentClient,
  tableName: string,
  chunkedItems: T[],
  logger: LogWriterType
): Promise<void> => {
  const params = {
    RequestItems: {
      [tableName]: chunkedItems.map((item) => ({
        PutRequest: {
          Item: marshall(item, { removeUndefinedValues: true }),
        },
      })),
    },
  };

  try {
    logger.LogInfo(`Batch write started for table ${tableName} with ${chunkedItems.length} items`);
    await db.send(new BatchWriteItemCommand(params));
    logger.LogInfo(`Batch write successful for table ${tableName}`);
  } catch (error) {
    logger.LogError(`Batch write failed for table ${tableName} - Error: ${error}`);
    throw new Error("Batch write failed");
  }
};

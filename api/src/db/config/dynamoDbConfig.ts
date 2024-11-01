import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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
        region: "localhost",
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

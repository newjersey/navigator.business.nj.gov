/* eslint-disable @typescript-eslint/no-unused-vars */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { UserDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { randomInt } from "@shared/intHelpers";
import { generateUser, generateUserData } from "@shared/test";

// references jest-dynalite-config values
const dbConfig = {
  tableName: "users-table-test",
};

describe("DynamoUserDataClient", () => {
  const config = {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  };

  let client: DynamoDBDocumentClient;
  let dynamoUserDataClient: UserDataClient;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    logger = DummyLogWriter;
    dynamoUserDataClient = DynamoUserDataClient(client, dbConfig.tableName, logger);
  });

  it("should throw an error when attempting to retrieve a non-existent user by ID", async () => {
    const randomUserId = `user-id-${randomInt()}`;
    await expect(dynamoUserDataClient.get(randomUserId)).rejects.toEqual(
      new Error(`User with ID ${randomUserId} not found in table ${dbConfig.tableName}`)
    );
  });

  it("gets inserted items", async () => {
    const userData = generateUserData({ user: generateUser({ id: "some-id" }) });
    await dynamoUserDataClient.put(userData);

    expect(await dynamoUserDataClient.get("some-id")).toEqual(userData);
  });

  it("finds a user by email", async () => {
    expect(await dynamoUserDataClient.findByEmail("email@example.com")).toBeUndefined();

    const userData = generateUserData({ user: generateUser({ email: "email@example.com" }) });
    await dynamoUserDataClient.put(userData);

    expect(await dynamoUserDataClient.findByEmail("email@example.com")).toEqual(userData);
  });
});

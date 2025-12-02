/* eslint-disable @typescript-eslint/no-unused-vars */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { type CryptoClient, UserDataClient } from "@domain/types";
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
  let cryptoClient: CryptoClient;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    cryptoClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };
    logger = DummyLogWriter;
    dynamoUserDataClient = DynamoUserDataClient(client, cryptoClient, dbConfig.tableName, logger);
  });

  it("throws an error when attempting to retrieve a non-existent user by ID", async () => {
    const randomUserId = `user-id-${randomInt()}`;
    await expect(dynamoUserDataClient.get(randomUserId)).rejects.toEqual(new Error("Not found"));
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

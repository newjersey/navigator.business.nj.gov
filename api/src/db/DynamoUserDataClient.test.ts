/* eslint-disable @typescript-eslint/no-unused-vars */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { generateUser, generateUserData } from "../../test/factories";
import { UserDataClient } from "../domain/types";
import { dynamoDbTranslateConfig, DynamoUserDataClient } from "./DynamoUserDataClient";

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

  beforeEach(() => {
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);

    dynamoUserDataClient = DynamoUserDataClient(client, dbConfig.tableName);
  });

  it("gets inserted items", async () => {
    await expect(dynamoUserDataClient.get("some-id")).rejects.toEqual("Not found");

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

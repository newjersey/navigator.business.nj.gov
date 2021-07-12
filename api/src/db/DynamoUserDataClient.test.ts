import AWS from "aws-sdk";
import { UserDataClient } from "../domain/types";
import { DynamoUserDataClient } from "./DynamoUserDataClient";
import { generateUser, generateUserData } from "../domain/factories";

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

  let client: AWS.DynamoDB.DocumentClient;
  let dynamoUserDataClient: UserDataClient;

  beforeEach(() => {
    client = new AWS.DynamoDB.DocumentClient(config);

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

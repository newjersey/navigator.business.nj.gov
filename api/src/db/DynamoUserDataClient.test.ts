import AWS from "aws-sdk";
import { UserDataClient } from "../domain/types";
import { DynamoUserDataClient } from "./DynamoUserDataClient";
import { generateUser, generateUserData } from "../domain/factories";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbConfig = require("../../jest-dynalite-config");

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

    // TODO: this will break if we add more tables
    dynamoUserDataClient = DynamoUserDataClient(client, dbConfig.tables[0].TableName);
  });

  it("gets inserted items", async () => {
    await expect(dynamoUserDataClient.get("some-id")).rejects.toEqual("Not found");

    const userData = generateUserData({ user: generateUser({ id: "some-id" }) });
    await dynamoUserDataClient.put(userData);

    expect(await dynamoUserDataClient.get("some-id")).toEqual(userData);
  });
});

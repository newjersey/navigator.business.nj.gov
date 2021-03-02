import AWS from "aws-sdk";
import { UserDataClient } from "../domain/types";
import { DynamoUserDataClient } from "./DynamoUserDataClient";
import { generateUser, generateUserData } from "../domain/factories";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbConfig = require("../../jest-dynamodb-config");

describe("DynamoUserDataClient", () => {
  const config = {
    convertEmptyValues: true,
    endpoint: `localhost:${dbConfig.port}`,
    sslEnabled: false,
    region: "local-env",
  };

  let dynamoUserDataClient: UserDataClient;

  beforeEach(() => {
    // this will break if we add more tables
    dynamoUserDataClient = DynamoUserDataClient(
      new AWS.DynamoDB.DocumentClient(config),
      dbConfig.tables[0].TableName
    );
  });

  it("gets inserted items", async () => {
    await expect(dynamoUserDataClient.get("some-id")).rejects.toEqual("Not found");

    const userData = generateUserData({ user: generateUser({ id: "some-id" }) });
    await dynamoUserDataClient.put(userData);

    expect(await dynamoUserDataClient.get("some-id")).toEqual(userData);
  });
});

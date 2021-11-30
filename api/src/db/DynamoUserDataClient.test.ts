/* eslint-disable @typescript-eslint/no-unused-vars */
import AWS from "aws-sdk";
import { UserDataClient, UserDataQlClient } from "../domain/types";
import { DynamoQlUserDataClient, DynamoUserDataClient } from "./DynamoUserDataClient";
import { generateUser, generateUserData } from "../../test/factories";
// import { clearTable } from "../../test/dynamodb-utils";

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

// describe("DynamoQlUserDataClient", () => {
//   const config = {
//     endpoint: "http://localhost:8004",
//     sslEnabled: false,
//     convertEmptyValues: true,
//     region: "local",
//   };

//   let client: AWS.DynamoDB;
//   let documentClient: AWS.DynamoDB.DocumentClient;
//   let userDataQlClient: UserDataQlClient;
//   let userDataDocumentClient: UserDataClient;
//   const userData1 = generateUserData({ user: generateUser({ id: "some-id1", receiveNewsletter: false }) });
//   const userData2 = generateUserData({
//     user: generateUser({
//       id: "some-id2",
//       receiveNewsletter: true,
//       externalStatus: { newsletter: { success: true, status: "SUCCESS" } },
//     }),
//   });
//   const userData3 = generateUserData({
//     user: generateUser({
//       id: "some-id3",
//       receiveNewsletter: true,
//       externalStatus: { newsletter: { success: false, status: "RESPONSE_ERROR" } },
//     }),
//   });
//   const userData4 = generateUserData({
//     user: generateUser({ id: "some-id4", receiveNewsletter: true, externalStatus: {} }),
//   });

//   beforeEach(async () => {
//     client = new AWS.DynamoDB(config);
//     userDataQlClient = DynamoQlUserDataClient(client, dbConfig.tableName);
//     documentClient = new AWS.DynamoDB.DocumentClient(config);
//     userDataDocumentClient = DynamoUserDataClient(documentClient, dbConfig.tableName);
//     await clearTable(client, dbConfig.tableName);
//   });

//   it("gets inserted items", async () => {
//     expect(await userDataQlClient.search(`SELECT data FROM "${dbConfig.tableName}"`)).toEqual([]);
//     await userDataDocumentClient.put(userData1);
//     await userDataDocumentClient.put(userData2);
//     await userDataDocumentClient.put(userData3);
//     await userDataDocumentClient.put(userData4);
//     const response = await userDataQlClient.search(`SELECT data FROM "${dbConfig.tableName}"`);
//     expect(new Set(response)).toEqual(new Set([userData1, userData2, userData3, userData4]));
//     expect(response.length).toBe(4);
//   });
//   it("gets valid newsletter users", async () => {
//     expect(await userDataQlClient.getNeedNewsletterUsers()).toEqual([]);
//     await userDataDocumentClient.put(userData1);
//     await userDataDocumentClient.put(userData2);
//     await userDataDocumentClient.put(userData3);
//     await userDataDocumentClient.put(userData4);
//     const response = await userDataQlClient.getNeedNewsletterUsers();
//     expect(new Set(response)).toEqual(new Set([userData3, userData4]));
//     expect(response.length).toBe(2);
//   });
// });

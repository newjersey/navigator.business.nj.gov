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

  describe("findAllByEmail", () => {
    it("returns every user holding the email", async () => {
      const email = "shared@example.com";
      const userA = generateUserData({ user: generateUser({ email }) });
      const userB = generateUserData({ user: generateUser({ email }) });
      const other = generateUserData({ user: generateUser({ email: "other@example.com" }) });
      await dynamoUserDataClient.put(userA);
      await dynamoUserDataClient.put(userB);
      await dynamoUserDataClient.put(other);

      const results = await dynamoUserDataClient.findAllByEmail(email);

      expect(results.map((it) => it.user.id).sort()).toEqual([userA.user.id, userB.user.id].sort());
    });

    it("returns an empty array when no user holds the email", async () => {
      expect(await dynamoUserDataClient.findAllByEmail("nobody@example.com")).toEqual([]);
    });
  });

  describe("claimEmailSignIn", () => {
    it("sets the claim timestamp when absent", async () => {
      const userData = generateUserData({ user: generateUser({}) });
      await dynamoUserDataClient.put(userData);

      await dynamoUserDataClient.claimEmailSignIn(userData.user.id, "2026-09-18T00:00:00.000Z");

      const stored = await dynamoUserDataClient.get(userData.user.id);
      expect(stored.user.emailSignInClaimedISO).toBe("2026-09-18T00:00:00.000Z");
    });

    it("leaves the rest of the record untouched", async () => {
      const userData = generateUserData({ user: generateUser({}) });
      await dynamoUserDataClient.put(userData);

      await dynamoUserDataClient.claimEmailSignIn(userData.user.id, "2026-09-18T00:00:00.000Z");

      const stored = await dynamoUserDataClient.get(userData.user.id);
      expect(stored).toEqual({
        ...userData,
        user: { ...userData.user, emailSignInClaimedISO: "2026-09-18T00:00:00.000Z" },
      });
    });

    it("leaves an existing claim untouched", async () => {
      const userData = generateUserData({
        user: generateUser({ emailSignInClaimedISO: "2020-01-01T00:00:00.000Z" }),
      });
      await dynamoUserDataClient.put(userData);

      await dynamoUserDataClient.claimEmailSignIn(userData.user.id, "2026-09-18T00:00:00.000Z");

      const stored = await dynamoUserDataClient.get(userData.user.id);
      expect(stored.user.emailSignInClaimedISO).toBe("2020-01-01T00:00:00.000Z");
    });

    it("does not create a record when the user does not exist", async () => {
      const userId = `no-such-user-${randomInt()}`;

      await expect(
        dynamoUserDataClient.claimEmailSignIn(userId, "2026-09-18T00:00:00.000Z"),
      ).resolves.toBeUndefined();

      await expect(dynamoUserDataClient.get(userId)).rejects.toEqual(new Error("Not found"));
    });
  });
});

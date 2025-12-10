import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoMessagesDataClient } from "@db/DynamoMessagesDataClient";
import { MessageData, MessagesDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { randomInt } from "@shared/intHelpers";
import { v4 as uuidv4 } from "uuid";

// references jest-dynalite-config values
const dbConfig = {
  tableName: "messages-table-test",
};
const generateMessageData = (overrides?: Partial<MessageData>): MessageData => {
  return {
    taskId: uuidv4(),
    userId: `user-${randomInt()}`,
    channel: "email",
    templateId: "welcome_version-B",
    topic: "welcome",
    templateData: {
      name: "Test User",
      business: "Test Business",
    },
    dueAt: new Date().toISOString(),
    deliveredAt: new Date().toISOString(),
    dateCreated: new Date().toISOString(),
    ...overrides,
  };
};

describe("DynamoMessagesDataClient", () => {
  const config = {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  };

  let client: DynamoDBDocumentClient;
  let dynamoMessagesDataClient: MessagesDataClient;
  let logger: LogWriterType;

  beforeEach(() => {
    logger = DummyLogWriter;
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    dynamoMessagesDataClient = DynamoMessagesDataClient(client, dbConfig.tableName, logger);
  });

  describe("get", () => {
    it("retrieves a message from the db", async () => {
      const messageData = generateMessageData();
      await dynamoMessagesDataClient.put(messageData);

      const retrievedMessage = await dynamoMessagesDataClient.get(messageData.taskId);
      expect(retrievedMessage).toEqual(messageData);
    });

    it("throws an error when attempting to retrieve a non-existent message by taskId", async () => {
      const randomTaskId = `task-id-${randomInt()}`;

      await expect(dynamoMessagesDataClient.get(randomTaskId)).rejects.toEqual(
        new Error("Not found"),
      );
    });
  });

  describe("put", () => {
    it("successfully inserts a message", async () => {
      const messageData = generateMessageData();

      const result = await dynamoMessagesDataClient.put(messageData);

      expect(result).toEqual(messageData);
      const retrievedMessage = await dynamoMessagesDataClient.get(messageData.taskId);
      expect(retrievedMessage).toEqual(messageData);
    });
  });

  describe("getMessagesDueAt", () => {
    it("returns messages that match the dueAt date", async () => {
      const targetDate = "2024-01-15T10:00:00.000Z";
      const message1 = generateMessageData({ dueAt: targetDate });
      const message2 = generateMessageData({ dueAt: targetDate });
      const differentDateMessage = generateMessageData({ dueAt: "2024-01-16T10:00:00.000Z" });

      await dynamoMessagesDataClient.put(message1);
      await dynamoMessagesDataClient.put(message2);
      await dynamoMessagesDataClient.put(differentDateMessage);

      const results = await dynamoMessagesDataClient.getMessagesDueAt(targetDate);

      expect(results).toHaveLength(2);
      expect(results).toContainEqual(message1);
      expect(results).toContainEqual(message2);
      expect(results).not.toContainEqual(differentDateMessage);
    });

    it("returns an empty array when no messages match the dueAt date", async () => {
      const nonExistentDate = "2099-12-31T00:00:00.000Z";

      const results = await dynamoMessagesDataClient.getMessagesDueAt(nonExistentDate);

      expect(results).toEqual([]);
    });
  });

  describe("getMessagesByUserId", () => {
    it("returns messages that match the userId", async () => {
      const userId = "some-id";
      const message1 = generateMessageData({ userId: userId });
      const message2 = generateMessageData({ userId: userId });
      const differentUserMessage = generateMessageData({ userId: "some-id-2" });

      await dynamoMessagesDataClient.put(message1);
      await dynamoMessagesDataClient.put(message2);
      await dynamoMessagesDataClient.put(differentUserMessage);

      const results = await dynamoMessagesDataClient.getMessagesByUserId(userId);

      expect(results).toHaveLength(2);
      expect(results).toContainEqual(message1);
      expect(results).toContainEqual(message2);
      expect(results).not.toContainEqual(differentUserMessage);
    });

    it("returns an empty array when no messages match the userId", async () => {
      const nonExistentUserId = "some-id";

      const results = await dynamoMessagesDataClient.getMessagesDueAt(nonExistentUserId);

      expect(results).toEqual([]);
    });
  });
});

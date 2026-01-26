// eslint-disable-next-line no-restricted-imports
import { handler } from "../functions/messagingService/app";

import { randomInt } from "@shared/intHelpers";
import { generateUser, generateUserData } from "@shared/test";

jest.mock("../functions/messagingService/emails/welcomeEmail.html", () => "<html>welcome</html>");
jest.mock(
  "../functions/messagingService/emails/testReminderEmail.html",
  () => "<html>reminder</html>",
);

const mockSesSend = jest.fn().mockResolvedValue({ MessageId: "ses-msg-1" });
jest.mock("@aws-sdk/client-ses", () => ({
  SESClient: jest.fn().mockImplementation(() => ({ send: mockSesSend })),
  SendEmailCommand: jest.fn().mockImplementation((input) => ({
    input: { ...input, toString: (): string => JSON.stringify(input) },
  })),
}));

const mockS3Send = jest.fn().mockResolvedValue({});
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockS3Send })),
  PutObjectCommand: jest.fn(),
}));

const mockPutMessage = jest.fn().mockResolvedValue({});
jest.mock("@db/DynamoMessagesDataClient", () => ({
  DynamoMessagesDataClient: jest.fn().mockImplementation(() => ({ put: mockPutMessage })),
}));

const userId = `some-user-id-${randomInt()}`;
const mockGetUser = jest.fn().mockResolvedValue({
  ...generateUserData({ user: generateUser({ receiveUpdatesAndReminders: true, id: userId }) }),
});
jest.mock("@db/DynamoUserDataClient", () => ({
  DynamoUserDataClient: jest.fn().mockImplementation(() => ({ get: mockGetUser })),
}));

jest.mock("@db/config/dynamoDbConfig", () => ({ createDynamoDbClient: jest.fn() }));
jest.mock("@client/AwsCryptoFactory", () => ({ AWSCryptoFactory: jest.fn(() => ({})) }));

jest.mock("@libs/logWriter", () => ({
  LogWriter: jest.fn().mockImplementation(() => ({
    GetId: (): string => "log-id",
    LogInfo: jest.fn(),
    LogError: jest.fn(),
  })),
}));

let reminderEmailsFlag = "true";

jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: (flag: string): string => {
    if (flag === "feature_reminder_emails_enabled") return reminderEmailsFlag;
    return "false";
  },
  USER_MESSAGING_CONFIG_VARS: {},
}));

describe("MessagingService Lambda", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reminderEmailsFlag = "true";
    process.env.MESSAGES_BUCKET = "test-bucket";
  });

  describe("feature flags", () => {
    it("sends reminders when 'feature_reminder_emails_enabled' is enabled", async () => {
      const result = await handler({
        userId,
        action: "x",
        messageType: "reminder-email",
      });

      expect(result.statusCode).toBe(200);
      expect(result.messageId).not.toBe("skipped");
      const body = JSON.parse(result.body);
      expect(body).toMatchObject({
        userId,
        channel: "email",
        templateId: "test-reminder-v1",
        topic: "reminder",
      });
    });

    it("does not send reminders when 'feature_reminder_emails_enabled' is disabled", async () => {
      reminderEmailsFlag = "false";

      const result = await handler({
        userId,
        action: "x",
        messageType: "reminder-email",
      });

      expect(result.statusCode).toBe(200);
      expect(result.messageId).toBe("skipped");
      const body = JSON.parse(result.body);
      expect(body.skipped).toBe(true);
      expect(body.reason).toBe("feature_not_enabled");
    });
  });

  describe("reminder email", () => {
    it("sends a reminder when user is subscribed to reminders", async () => {
      const result = await handler({ userId, action: "x", messageType: "reminder-email" });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body).toMatchObject({
        userId,
        channel: "email",
        templateId: "test-reminder-v1",
        topic: "reminder",
      });
    });

    it("does not send a reminder when user is not subscribed to reminders", async () => {
      (mockGetUser as jest.Mock).mockResolvedValueOnce({
        ...generateUserData({
          user: generateUser({ receiveUpdatesAndReminders: false, id: userId }),
        }),
      });

      const result = await handler({ userId, action: "x", messageType: "reminder-email" });

      expect(result.statusCode).toBe(200);
      expect(result.messageId).toBe("skipped");
      const body = JSON.parse(result.body);
      expect(body.skipped).toBe(true);
      expect(body.reason).toBe("user_not_subscribed");
    });
  });

  it("sends welcome email", async () => {
    const result = await handler({ userId, action: "x", messageType: "welcome-email" });

    expect(result.statusCode).toBe(200);
    expect(typeof result.messageId).toBe("string");
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({
      userId,
      channel: "email",
      templateId: "welcome_version-B",
      topic: "welcome",
    });
    expect(mockSesSend).toHaveBeenCalled();
    expect(mockPutMessage).toHaveBeenCalled();
  });

  it("stores a copy of the sent message in S3", async () => {
    const result = await handler({ userId, action: "x", messageType: "welcome-email" });

    expect(result.statusCode).toBe(200);
    expect(typeof result.messageId).toBe("string");
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({
      userId,
      channel: "email",
      templateId: "welcome_version-B",
      topic: "welcome",
    });
    expect(mockS3Send).toHaveBeenCalled();
  });

  it("writes a record of the transaction to the Messages Database", async () => {
    const result = await handler({ userId, action: "x", messageType: "welcome-email" });

    expect(result.statusCode).toBe(200);
    expect(typeof result.messageId).toBe("string");
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({
      userId,
      channel: "email",
      templateId: "welcome_version-B",
      topic: "welcome",
    });
    expect(mockPutMessage).toHaveBeenCalled();
  });
});

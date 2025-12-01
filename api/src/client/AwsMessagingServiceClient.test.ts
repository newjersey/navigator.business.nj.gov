import { InvokeCommand } from "@aws-sdk/client-lambda";
import { AwsMessagingServiceClient } from "@client/AwsMessagingServiceClient";
import { MessagingServiceClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { randomInt } from "@shared/intHelpers";
import { ReasonPhrases } from "http-status-codes";

const mockSend = jest.fn();

jest.mock("@aws-sdk/client-lambda", () => {
  return {
    LambdaClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    InvokeCommand: jest.fn().mockImplementation((params) => params),
  };
});

describe("MessagingServiceClient", () => {
  let client: MessagingServiceClient;

  const mockLogWriter = {
    GetId: jest.fn().mockReturnValue("test-id"),
    LogInfo: jest.fn(),
    LogError: jest.fn(),
  } as unknown as LogWriterType;

  const config = {
    logWriter: mockLogWriter,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    client = AwsMessagingServiceClient(config);
  });

  describe("sendMessage", () => {
    it("should successfully send a message", async () => {
      const messageId = `message-${randomInt()}`;
      const messageType = "welcome-email";
      const userId = `user-${randomInt()}`;

      mockSend.mockResolvedValueOnce({
        StatusCode: 200,
        Payload: Buffer.from(JSON.stringify({ messageId })),
      });

      const result = await client.sendMessage(userId, messageType);

      expect(result).toEqual({
        success: true,
        messageId,
      });

      expect(InvokeCommand).toHaveBeenCalledWith({
        FunctionName: "sendEmailTest",
        InvocationType: "RequestResponse",
        Payload: Buffer.from(
          JSON.stringify({
            action: "sendMessage",
            userId,
            messageType,
          }),
        ),
      });
      expect(mockLogWriter.LogInfo).toHaveBeenCalled();
    });

    it("should handle Lambda function errors", async () => {
      const userId = `user-${randomInt()}`;
      const messageType = "welcome-email";
      const errorMessage = "Message sending failed";

      mockSend.mockResolvedValueOnce({
        StatusCode: 200,
        FunctionError: "Handled",
        Payload: Buffer.from(JSON.stringify({ errorMessage })),
      });

      const result = await client.sendMessage(userId, messageType);

      expect(result).toEqual({
        success: false,
        error: errorMessage,
      });

      expect(mockLogWriter.LogError).toHaveBeenCalled();
    });

    it("should handle general server errors when sending message", async () => {
      const userId = `user-${randomInt()}`;
      const messageType = "welcome-email";

      mockSend.mockRejectedValueOnce(new Error("Network failure"));

      const result = await client.sendMessage(userId, messageType);

      expect(result).toEqual({
        success: false,
        error: "Network failure",
      });

      expect(mockLogWriter.LogError).toHaveBeenCalled();
    });
  });

  describe("health", () => {
    it("should return success when health check passes", async () => {
      mockSend.mockResolvedValueOnce({
        StatusCode: 200,
        Payload: Buffer.from(JSON.stringify({})),
      });

      const result = await client.health();

      expect(result).toEqual({
        success: true,
        data: {
          message: ReasonPhrases.OK,
        },
      });
    });

    it("should handle general server errors during health check", async () => {
      mockSend.mockRejectedValueOnce(new Error("Network failure"));

      const result = await client.health();

      expect(result).toEqual({
        success: false,
        error: {
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          serverResponseBody: "Network failure",
        },
      });
      expect(mockLogWriter.LogError).toHaveBeenCalled();
    });
  });
});

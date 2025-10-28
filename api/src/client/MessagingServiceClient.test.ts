import { InvokeCommand } from "@aws-sdk/client-lambda";
import { createMessagingServiceClient } from "@client/MessagingServiceClient";
import { LogWriterType } from "@libs/logWriter";
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
  const mockLogWriter = {
    GetId: jest.fn().mockReturnValue("test-id"),
    LogInfo: jest.fn(),
    LogError: jest.fn(),
  } as unknown as LogWriterType;

  const config = {
    functionName: "fakeEmailFunction",
    logWriter: mockLogWriter,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendEmail", () => {
    it("should successfully send an email", async () => {
      const messageId = "msg-123456";
      mockSend.mockResolvedValueOnce({
        StatusCode: 200,
        Payload: Buffer.from(JSON.stringify({ messageId })),
      });

      const client = createMessagingServiceClient(config);
      const result = await client.sendEmail("test@example.com", {
        templateId: "welcome-email",
        templateData: { name: "User" },
      });

      expect(result).toEqual({
        success: true,
        messageId,
      });

      expect(InvokeCommand).toHaveBeenCalledWith({
        FunctionName: "fakeEmailFunction",
        InvocationType: "RequestResponse",
        Payload: Buffer.from(
          JSON.stringify({
            action: "sendEmail",
            toEmail: "test@example.com",
            data: {
              name: "User",
            },
            templateId: "welcome-email",
          }),
        ),
      });
      expect(mockLogWriter.LogInfo).toHaveBeenCalled();
    });

    it("should handle Lambda function errors", async () => {
      mockSend.mockResolvedValueOnce({
        StatusCode: 200,
        FunctionError: "Handled",
        Payload: Buffer.from(JSON.stringify({ errorMessage: "Email sending failed" })),
      });

      const client = createMessagingServiceClient(config);
      const result = await client.sendEmail("test@example.com");

      expect(result).toEqual({
        success: false,
        error: "Email sending failed",
      });

      expect(mockLogWriter.LogError).toHaveBeenCalled();
    });

    it("should handle general errors when sending email", async () => {
      const errorMessage = "Lambda invocation failed";
      mockSend.mockRejectedValueOnce(new Error(errorMessage));

      const client = createMessagingServiceClient(config);
      const result = await client.sendEmail("test@example.com");

      expect(result).toEqual({
        success: false,
        error: errorMessage,
      });

      expect(mockLogWriter.LogError).toHaveBeenCalled();
    });
  });

  describe("health", () => {
    it("should return success when health check passes", async () => {
      mockSend.mockResolvedValueOnce({
        StatusCode: 200,
        Payload: Buffer.from(JSON.stringify({ status: "healthy" })),
      });

      const client = createMessagingServiceClient(config);
      const result = await client.health();

      expect(result).toEqual({
        success: true,
        data: {
          message: ReasonPhrases.OK,
        },
      });

      expect(InvokeCommand).toHaveBeenCalledWith({
        FunctionName: "fakeEmailFunction",
        InvocationType: "RequestResponse",
        Payload: Buffer.from(JSON.stringify({ action: "health" })),
      });
    });

    it("should handle Lambda function errors during health check", async () => {
      mockSend.mockResolvedValueOnce({
        StatusCode: 500,
        FunctionError: "Unhandled",
        Payload: Buffer.from(JSON.stringify({ errorMessage: "Health check failed" })),
      });

      const client = createMessagingServiceClient(config);
      const result = await client.health();

      expect(result).toEqual({
        success: false,
        error: {
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          serverResponseBody: "Health check failed",
        },
      });

      expect(mockLogWriter.LogError).not.toHaveBeenCalled();
    });

    it("should handle exceptions during health check", async () => {
      mockSend.mockRejectedValueOnce(new Error("Lambda invocation failed"));

      const client = createMessagingServiceClient(config);
      const result = await client.health();

      expect(result).toEqual({
        success: false,
        error: {
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          serverResponseBody: "Lambda invocation failed",
        },
      });

      expect(mockLogWriter.LogError).toHaveBeenCalled();
    });
  });
});

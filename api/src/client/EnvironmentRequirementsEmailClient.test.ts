import { EmailConfirmationResponse } from "@businessnjgovnavigator/shared";
import { ApiPowerAutomateClientFactory } from "@client/ApiPowerAutomateClientFactory";
import { EnvironmentRequirementsEmailClient } from "@client/EnvironmentRequirementsEmailClient";
import { PowerAutomateClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import { generateEmailConfirmationSubmission } from "@shared/test";
import { StatusCodes } from "http-status-codes";

jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: jest.fn(),
}));

jest.mock("@client/ApiPowerAutomateClientFactory", () => ({
  ApiPowerAutomateClientFactory: jest.fn(),
}));

const mockSuccessEmailResponse: EmailConfirmationResponse = {
  statusCode: 200,
  message: "Email confirmation successfully sent",
};

const mockErrorEmailResponse: EmailConfirmationResponse = {
  statusCode: 500,
  message: "Failed to send email confirmation",
};

const mockPowerAutomateClient = ApiPowerAutomateClientFactory as jest.MockedFunction<
  typeof ApiPowerAutomateClientFactory
>;
const getConfigValueMock = getConfigValue as jest.MockedFunction<typeof getConfigValue>;
const startWorkflow = jest.fn();

describe("EnvironmentRequirementsEmailClient", () => {
  const emailClient = EnvironmentRequirementsEmailClient(DummyLogWriter);

  beforeEach(() => {
    jest.resetAllMocks();

    getConfigValueMock.mockImplementation(async (key: string) => {
      if (key === "environment_requirements_email_url") return "https://example.com/flow";
      if (key === "environment_requirements_email_key") return "api-key-xyz";
      throw new Error("unexpected key");
    });

    mockPowerAutomateClient.mockReturnValue({
      startWorkflow,
      health: jest.fn(),
    } as PowerAutomateClient);
  });

  describe("sendEmail", () => {
    it("returns a successful response when email is sent successfully", async () => {
      startWorkflow.mockResolvedValue({
        status: StatusCodes.OK,
        data: { message: mockSuccessEmailResponse.message },
      });
      const postBody = generateEmailConfirmationSubmission({});
      const response = await emailClient.sendEmail(postBody);

      expect(response).toEqual({
        statusCode: StatusCodes.OK,
        message: "Email confirmation successfully sent",
      });
    });

    it("returns an error response when email cannot be sent", async () => {
      startWorkflow.mockRejectedValue({
        message: mockErrorEmailResponse.message,
      });
      const postBody = generateEmailConfirmationSubmission({});
      const response = await emailClient.sendEmail(postBody);

      expect(response).toEqual({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to send email confirmation",
      });
    });
  });
});

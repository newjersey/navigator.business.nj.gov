import { EmailMetaData } from "@businessnjgovnavigator/shared";
import { ApiEnvPermitEmailClient } from "@client/ApiEnvPermitEmailClient";
import { DummyLogWriter } from "@libs/logWriter";
import { ENV_REQ_CONFIG_VARS, getConfigValue } from "@libs/ssmUtils";
import axios from "axios";

jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: jest.fn(),
  isKillSwitchOn: jest.fn(),
  updateKillSwitch: jest.fn(),
}));

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  (paramName: ENV_REQ_CONFIG_VARS) => Promise<string>
>;

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const emailClient = ApiEnvPermitEmailClient(DummyLogWriter);

describe("ApiEnvPermitEmailClient", () => {
  const mockValues = {
    env_req_email_confirmation_url: "https://test-api.example.com",
    env_req_email_confirmation_key: "test-api-key",
  };

  const emailMetaData: EmailMetaData = {
    userName: "Test User",
    businessName: "Test Business",
    email: "test@example.com",
    industry: "generic",
    location: "Trenton",
    phase: "FORMED",
    naicsCode: "12345",
    questionnaireResponses: "RESPONSES",
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetConfigValue.mockImplementation((param) => {
      return Promise.resolve(mockValues[param] || "");
    });
  });

  it("sends an email successfully", async () => {
    mockAxios.post.mockResolvedValue({
      data: "Email sent successfully",
    });
    const result = await emailClient.sendEmail(emailMetaData);

    expect(getConfigValue).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenCalledWith(
      "https://test-api.example.com",
      { ...emailMetaData, "api-key": "test-api-key" },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(result).toBe("Email sent successfully");
  });

  it("handles failure in sending email", async () => {
    mockAxios.post.mockRejectedValue(new Error("Failed"));
    const result = await emailClient.sendEmail(emailMetaData);

    expect(getConfigValue).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenCalledWith(
      "https://test-api.example.com",
      { ...emailMetaData, "api-key": "test-api-key" },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    expect(result).toBe("Failed");
  });
});

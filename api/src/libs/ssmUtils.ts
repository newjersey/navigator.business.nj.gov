import { GetParameterCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({});
const parameterName = `/${process.env.STAGE}/feature-flag/users-migration/kill-switch`;

export type CONFIG_VARS =
  | "cigarette_license_base_url"
  | "cigarette_license_api_key"
  | "cigarette_license_merchant_code"
  | "cigarette_license_merchant_key"
  | "cigarette_license_service_code"
  | "cigarette_license_email_confirmation_url"
  | "cigarette_license_email_confirmation_key";

const WIREMOCK_VALUES: Record<CONFIG_VARS, string> = {
  cigarette_license_base_url: "http://localhost:9000/cigarette-license",
  cigarette_license_api_key: "mock-api-key-12345",
  cigarette_license_merchant_code: "MOCK_MERCHANT_001",
  cigarette_license_merchant_key: "mock-merchant-key-abcdef",
  cigarette_license_service_code: "MOCK_SERVICE_CODE",
  cigarette_license_email_confirmation_url:
    "http://localhost:9000/cigarette-license/send-email-confirmation",
  cigarette_license_email_confirmation_key: "mock-confirmation-key-xyz789",
};

let cache: {
  value?: boolean;
  expiresAt?: number;
} = {};

export const getConfigValue = async (paramName: CONFIG_VARS): Promise<string> => {
  try {
    if (process.env.STAGE === "local") {
      const mockValue = WIREMOCK_VALUES[paramName];
      return mockValue;
    }

    const ssmPath = `/${process.env.STAGE}/${paramName}`;
    const command = new GetParameterCommand({
      Name: ssmPath,
    });

    const response = await ssmClient.send(command);
    const paramValue = response.Parameter?.Value ?? "";

    return paramValue;
  } catch (error) {
    console.error(`Failed to read parameter ${paramName}:`, error);
    return "";
  }
};

export const isKillSwitchOn = async (): Promise<boolean> => {
  const now = Date.now();

  if (cache.value !== undefined && cache.expiresAt && cache.expiresAt > now) {
    return cache.value;
  }
  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true,
    });

    const response = await ssmClient.send(command);
    const paramValue = response.Parameter?.Value ?? "false";
    const boolValue = paramValue.toLowerCase() === "true";

    cache = {
      value: boolValue,
      expiresAt: now + 30 * 1000,
    };

    return boolValue;
  } catch (error) {
    console.error("Failed to read kill switch parameter:", error);
    return false;
  }
};

export const updateKillSwitch = async (): Promise<void> => {
  try {
    const value = true;
    const command = new PutParameterCommand({
      Name: parameterName,
      Value: value.toString(),
      Type: "SecureString",
      Overwrite: true,
    });
    await ssmClient.send(command);
  } catch (error) {
    console.error("Failed to update kill switch parameter:", error);
    throw error;
  }
};

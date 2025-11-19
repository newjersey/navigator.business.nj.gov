import { GetParameterCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { LogWriterType } from "@libs/logWriter";

const ssmClient = new SSMClient({});
const parameterName = `/${process.env.STAGE}/feature-flag/users-migration/kill-switch`;

type EMPLOYER_RATES_PATH = "boomi-runtime/alb-url";

export type CONFIG_VARS =
  | "cms_alerts_sns_topic_arn"
  | EMPLOYER_RATES_PATH
  | CIGARETTE_PAYMENT_CONFIG_VARS
  | CIGARETTE_EMAIL_CONFIG_VARS
  | ENV_REQ_CONFIG_VARS
  | USER_MESSAGING_CONFIG_VARS;

export type CIGARETTE_PAYMENT_CONFIG_VARS =
  | "cigarette_license_base_url"
  | "cigarette_license_api_key"
  | "cigarette_license_merchant_code"
  | "cigarette_license_merchant_key"
  | "cigarette_license_service_code";

export type CIGARETTE_EMAIL_CONFIG_VARS =
  | "cigarette_license_email_confirmation_url"
  | "cigarette_license_email_confirmation_key";

export type ENV_REQ_CONFIG_VARS =
  | "env_req_email_confirmation_url"
  | "env_req_email_confirmation_key";

export type USER_MESSAGING_CONFIG_VARS = "feature_welcome_email_enabled";

let cache: {
  value?: boolean;
  expiresAt?: number;
} = {};

export const getConfigValue = async (
  paramName: CONFIG_VARS,
  logger?: LogWriterType,
): Promise<string> => {
  if (process.env.STAGE === "local") {
    const envVarName = paramName.toUpperCase().replaceAll("-", "_");
    const envValue = process.env[envVarName];
    if (envValue !== undefined) {
      return envValue;
    }
  }

  try {
    const ssmPath = `/${process.env.STAGE}/${paramName}`;
    logger?.LogInfo(`Fetching SSM parameter: ${ssmPath}`);
    const command = new GetParameterCommand({
      Name: ssmPath,
    });

    const response = await ssmClient.send(command);
    const paramValue = response.Parameter?.Value ?? "";
    logger?.LogInfo(
      `Contains: ${response.Parameter?.Value ? `Value found: ********${paramValue.slice(-3)}` : "No value found"}`,
    );

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

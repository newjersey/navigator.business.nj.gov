import { GetParameterCommand, PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({});
const parameterName = `/${process.env.STAGE}/feature-flag/users-migration/kill-switch`;
const cigLicenseEmaril =
  process.env.STAGE === "local"
    ? "/dev/cigarette_license_email_confirmation_url"
    : `/${process.env.STAGE}/cigarette_license_email_confirmation_url`;

let cache: {
  value?: boolean;
  expiresAt?: number;
} = {};

export const getCigLicenseEmailUrl = async (): Promise<string> => {
  try {
    const command = new GetParameterCommand({
      Name: cigLicenseEmaril,
    });

    const response = await ssmClient.send(command);
    const paramValue = response.Parameter?.Value ?? "";

    return paramValue;
  } catch (error) {
    console.error("Failed to read kill switch parameter:", error);
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
